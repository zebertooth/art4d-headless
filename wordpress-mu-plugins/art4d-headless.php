<?php
/**
 * Plugin Name: art4d Headless Bridge
 * Description: Public Meta Slider REST API + publish webhook for the art4d-headless Next.js frontend.
 * Version: 1.0.0
 * Author: art4d
 *
 * Install: copy to wp-content/mu-plugins/art4d-headless.php on art4d.com
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * wp-config.php (recommended):
 *
 * define('ART4D_HEADLESS_URL', 'https://art4d-headless.vercel.app');
 * define('ART4D_REVALIDATE_SECRET', 'same-value-as-vercel-REVALIDATE_SECRET');
 */

function art4d_headless_site_url() {
    if (defined('ART4D_HEADLESS_URL')) {
        return rtrim(ART4D_HEADLESS_URL, '/');
    }
    return 'https://art4d-headless.vercel.app';
}

function art4d_headless_revalidate_secret() {
    if (defined('ART4D_REVALIDATE_SECRET')) {
        return ART4D_REVALIDATE_SECRET;
    }
    $env = getenv('ART4D_REVALIDATE_SECRET');
    return $env ? $env : '';
}

add_action('rest_api_init', function () {
    register_rest_route('art4d/v1', '/slideshow/(?P<id>\d+)', [
        'methods'             => 'GET',
        'callback'            => 'art4d_rest_get_slideshow',
        'permission_callback' => '__return_true',
        'args'                => [
            'id' => [
                'required'          => true,
                'validate_callback' => function ($param) {
                    return is_numeric($param) && (int) $param > 0;
                },
            ],
        ],
    ]);

    register_rest_route('art4d/v1', '/slideshows', [
        'methods'             => 'GET',
        'callback'            => 'art4d_rest_list_slideshows',
        'permission_callback' => '__return_true',
    ]);
});

function art4d_rest_list_slideshows() {
    if (!post_type_exists('ml-slider')) {
        return new WP_REST_Response(['slideshows' => []], 200);
    }

    $sliders = get_posts([
        'post_type'        => 'ml-slider',
        'post_status'      => 'publish',
        'posts_per_page'   => -1,
        'orderby'          => 'title',
        'order'            => 'ASC',
        'suppress_filters' => true,
    ]);

    $out = [];
    foreach ($sliders as $slider) {
        $settings = art4d_get_ml_slider_settings($slider->ID);
        $slides   = art4d_get_ml_slider_slides_raw($slider->ID);
        $out[]    = [
            'id'          => $slider->ID,
            'label'       => $slider->post_title,
            'width'       => $settings['width'],
            'height'      => $settings['height'],
            'slide_count' => count($slides),
        ];
    }

    return new WP_REST_Response(['slideshows' => $out], 200);
}

function art4d_rest_get_slideshow(WP_REST_Request $request) {
    $id        = (int) $request['id'];
    $slideshow = art4d_build_slideshow($id);

    if (is_wp_error($slideshow)) {
        return $slideshow;
    }

    return new WP_REST_Response($slideshow, 200);
}

function art4d_get_ml_slider_settings($slideshow_id) {
    $settings = get_post_meta($slideshow_id, 'ml-slider_settings', true);

    if (is_string($settings)) {
        $decoded = json_decode($settings, true);
        if (is_array($decoded)) {
            $settings = $decoded;
        } else {
            $settings = maybe_unserialize($settings);
        }
    }

    if (!is_array($settings)) {
        $settings = [];
    }

    return [
        'width'  => isset($settings['width']) ? (int) $settings['width'] : 1200,
        'height' => isset($settings['height']) ? (int) $settings['height'] : 675,
    ];
}

function art4d_get_ml_slider_slides_raw($slideshow_id) {
    if (!post_type_exists('ml-slide')) {
        return [];
    }

    $query_args = [
        'post_type'        => 'ml-slide',
        'posts_per_page'   => -1,
        'orderby'          => 'menu_order',
        'order'            => 'ASC',
        'post_status'      => 'publish',
        'suppress_filters' => true,
    ];

    $slides = get_posts(array_merge($query_args, [
        'tax_query' => [[
            'taxonomy' => 'ml-slider',
            'field'    => 'slug',
            'terms'    => (string) $slideshow_id,
        ]],
    ]));

    if (empty($slides)) {
        $slides = get_posts(array_merge($query_args, [
            'tax_query' => [[
                'taxonomy' => 'ml-slider',
                'field'    => 'term_id',
                'terms'    => [$slideshow_id],
            ]],
        ]));
    }

    return $slides;
}

function art4d_build_slide_payload($slide) {
    $slide_id = $slide->ID;
    $meta     = get_post_meta($slide_id, 'ml-slider_metadata', true);

    if (is_string($meta)) {
        $meta = maybe_unserialize($meta);
    }
    if (!is_array($meta)) {
        $meta = [];
    }

    $href = '';
    foreach (['url', 'link', 'slide_url'] as $key) {
        if (!empty($meta[$key])) {
            $href = $meta[$key];
            break;
        }
    }
    if (!$href) {
        $href = get_post_meta($slide_id, 'ml-slider_url', true);
    }
    if (!$href) {
        $href = get_post_meta($slide_id, 'url', true);
    }

    $attachment_id = (int) get_post_thumbnail_id($slide_id);
    if (!$attachment_id) {
        $attachment_id = (int) get_post_meta($slide_id, '_thumbnail_id', true);
    }
    if (!$attachment_id && !empty($meta['attachment_id'])) {
        $attachment_id = (int) $meta['attachment_id'];
    }

    $image = '';
    if ($attachment_id) {
        $image = wp_get_attachment_image_url($attachment_id, 'full');
    }
    if (!$image && !empty($meta['crop_source_image_url'])) {
        $image = $meta['crop_source_image_url'];
    }
    if (!$image && !empty($meta['src'])) {
        $image = $meta['src'];
    }

    $title = '';
    if (!empty($meta['title'])) {
        $title = $meta['title'];
    } elseif ($attachment_id) {
        $title = get_the_title($attachment_id);
    } else {
        $title = get_the_title($slide_id);
    }

    if (!$image) {
        return null;
    }

    return [
        'id'    => (string) $slide_id,
        'href'  => $href ?: '#',
        'image' => $image,
        'title' => html_entity_decode(wp_strip_all_tags($title), ENT_QUOTES, 'UTF-8'),
    ];
}

function art4d_extract_slides_from_shortcode($slideshow_id) {
    $html = do_shortcode('[metaslider id="' . intval($slideshow_id) . '"]');
    if (!$html) {
        return [];
    }

    $slides = [];
    $pattern = '/<a\s+[^>]*href="([^"]*)"[^>]*>\s*<img([^>]*class="[^"]*slide-(\d+)[^"]*"[^>]*)>/i';

    if (preg_match_all($pattern, $html, $matches, PREG_SET_ORDER)) {
        foreach ($matches as $m) {
            $attrs = $m[2];
            $image = '';
            $title = '';

            if (preg_match('/src="([^"]+)"/', $attrs, $src)) {
                $image = $src[1];
            }
            if (preg_match('/title="([^"]*)"/', $attrs, $t)) {
                $title = $t[1];
            }

            if ($image) {
                $slides[] = [
                    'id'    => $m[3],
                    'href'  => $m[1],
                    'image' => $image,
                    'title' => html_entity_decode($title, ENT_QUOTES, 'UTF-8'),
                ];
            }
        }
    }

    return $slides;
}

function art4d_build_slideshow($slideshow_id) {
    $post = get_post($slideshow_id);
    if (!$post || $post->post_type !== 'ml-slider' || $post->post_status !== 'publish') {
        return new WP_Error('not_found', 'Slideshow not found', ['status' => 404]);
    }

    $settings = art4d_get_ml_slider_settings($slideshow_id);
    $slides   = [];

    foreach (art4d_get_ml_slider_slides_raw($slideshow_id) as $slide) {
        $payload = art4d_build_slide_payload($slide);
        if ($payload) {
            $slides[] = $payload;
        }
    }

    if (empty($slides)) {
        $slides = art4d_extract_slides_from_shortcode($slideshow_id);
    }

    return [
        'id'     => $slideshow_id,
        'label'  => $post->post_title,
        'width'  => $settings['width'],
        'height' => $settings['height'],
        'slides' => $slides,
    ];
}

function art4d_headless_ping_revalidate($payload = []) {
    $secret = art4d_headless_revalidate_secret();
    if (!$secret) {
        return;
    }

    wp_remote_post(art4d_headless_site_url() . '/api/revalidate', [
        'timeout'  => 5,
        'blocking' => false,
        'headers'  => [
            'Content-Type'        => 'application/json',
            'x-revalidate-secret' => $secret,
        ],
        'body' => wp_json_encode($payload),
    ]);
}

add_action('save_post', function ($post_id, $post) {
    if (wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) {
        return;
    }
    if ($post->post_status !== 'publish') {
        return;
    }

    if ($post->post_type === 'post') {
        $lang = function_exists('pll_get_post_language')
            ? pll_get_post_language($post_id)
            : 'en';

        art4d_headless_ping_revalidate([
            'slug' => $post->post_name,
            'lang' => $lang ?: 'en',
        ]);
        return;
    }

    if (in_array($post->post_type, ['ml-slider', 'ml-slide'], true)) {
        art4d_headless_ping_revalidate(['paths' => ['/', '/th']]);
    }
}, 20, 2);
