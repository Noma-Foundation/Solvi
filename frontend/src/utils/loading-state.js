import $ from "jquery";

/**
 * Toggles a Bootstrap spinner and disabled state on a button while an async
 * action (e.g. a pywebview API call) is in flight. The button's original
 * content is restored when loading is turned off.
 *
 * @param {JQuery} $button - The button to toggle.
 * @param {Boolean} isLoading - Whether the button should show its loading state.
 */
export function setButtonLoading($button, isLoading) {
    if (isLoading) {
        if ($button.data("original-html") === undefined) {
            $button.data("original-html", $button.html());
        }
        $button.prop("disabled", true).html(
            '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>'
        );
        return;
    }

    const original = $button.data("original-html");
    if (original !== undefined) {
        $button.html(original);
        $button.removeData("original-html");
    }
    $button.prop("disabled", false);
}

/**
 * Shows or hides a centered spinner overlay covering a container while its
 * content is being loaded. The container must have `position: relative` (or
 * similar) for the overlay to align correctly.
 *
 * @param {JQuery} $container - The container to overlay.
 * @param {Boolean} isLoading - Whether the overlay should be shown.
 */
export function setContainerLoading($container, isLoading) {
    if (isLoading) {
        if ($container.find("> .loading-overlay").length) { return; }
        $container.append(
            '<div class="loading-overlay d-flex align-items-center justify-content-center">' +
            '<span class="spinner-border text-primary" role="status" aria-hidden="true"></span>' +
            '</div>'
        );
        return;
    }

    $container.find("> .loading-overlay").remove();
}
