(function () {
    var pdfJsPromise = null;
    var pdfJsWorkerUrl = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    var pdfJsScriptUrl = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js';

    function closest(element, selector) {
        while (element && element.nodeType === 1) {
            if (element.matches && element.matches(selector)) {
                return element;
            }

            element = element.parentElement;
        }

        return null;
    }

    function loadPdfJs() {
        if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = pdfJsWorkerUrl;
            return Promise.resolve(window.pdfjsLib);
        }

        if (pdfJsPromise) {
            return pdfJsPromise;
        }

        pdfJsPromise = new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = pdfJsScriptUrl;
            script.async = true;
            script.onload = function () {
                if (!window.pdfjsLib) {
                    reject(new Error('PDF.js failed to initialize.'));
                    return;
                }

                window.pdfjsLib.GlobalWorkerOptions.workerSrc = pdfJsWorkerUrl;
                resolve(window.pdfjsLib);
            };
            script.onerror = function () {
                reject(new Error('PDF.js could not be loaded.'));
            };
            document.head.appendChild(script);
        });

        return pdfJsPromise;
    }

    function initPdfViewer(viewer) {
        var url = viewer.getAttribute('data-ied-pdf-url');
        if (!url || viewer.getAttribute('data-ied-pdf-ready') === '1') {
            return;
        }

        viewer.setAttribute('data-ied-pdf-ready', '1');

        loadPdfJs()
            .then(function (pdfjsLib) {
                return pdfjsLib.getDocument({ url: url }).promise;
            })
            .then(function (pdf) {
                renderPdfDocument(viewer, pdf);
                observePdfResize(viewer, pdf);
            })
            .catch(function () {
                viewer.innerHTML = '<div class="ied-pdf-error">Unable to load the PDF file.</div>';
            });
    }

    function observePdfResize(viewer, pdf) {
        var lastWidth = viewer.clientWidth;
        var timer = null;

        function rerenderIfNeeded() {
            var nextWidth = viewer.clientWidth;
            if (Math.abs(nextWidth - lastWidth) < 12) {
                return;
            }

            lastWidth = nextWidth;
            window.clearTimeout(timer);
            timer = window.setTimeout(function () {
                renderPdfDocument(viewer, pdf);
            }, 120);
        }

        if (window.ResizeObserver) {
            var observer = new ResizeObserver(rerenderIfNeeded);
            observer.observe(viewer);
            return;
        }

        window.addEventListener('resize', rerenderIfNeeded);
    }

    function renderPdfDocument(viewer, pdf) {
        var renderToken = String(Date.now());
        viewer.setAttribute('data-ied-render-token', renderToken);
        viewer.innerHTML = '';

        var pages = document.createElement('div');
        pages.className = 'ied-pdf-pages';
        viewer.appendChild(pages);

        var width = Math.max(280, viewer.clientWidth - 2);
        var pageQueue = Promise.resolve();

        for (var pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
            pageQueue = pageQueue.then(renderPage.bind(null, viewer, pages, pdf, pageNumber, width, renderToken));
        }
    }

    function renderPage(viewer, pages, pdf, pageNumber, containerWidth, renderToken) {
        return pdf.getPage(pageNumber).then(function (page) {
            if (viewer.getAttribute('data-ied-render-token') !== renderToken) {
                return;
            }

            var viewport = page.getViewport({ scale: 1 });
            var cssScale = containerWidth / viewport.width;
            var outputScale = Math.min(window.devicePixelRatio || 1, 2);
            var scaledViewport = page.getViewport({ scale: cssScale * outputScale });
            var displayViewport = page.getViewport({ scale: cssScale });
            var pageWrap = document.createElement('div');
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');

            pageWrap.className = 'ied-pdf-page';
            canvas.width = Math.ceil(scaledViewport.width);
            canvas.height = Math.ceil(scaledViewport.height);
            canvas.style.width = Math.ceil(displayViewport.width) + 'px';
            canvas.style.height = Math.ceil(displayViewport.height) + 'px';
            pageWrap.appendChild(canvas);
            pages.appendChild(pageWrap);

            if (!context) {
                return;
            }

            return page.render({
                canvasContext: context,
                viewport: scaledViewport
            }).promise.then(function () {
                page.cleanup();
            });
        });
    }

    function initRoot(root) {
        var imagesScript = root.querySelector('script[data-ied-images]');
        var gallery = root.querySelector('[data-ied-gallery]');
        var pdfViewer = root.querySelector('[data-ied-pdf-url]');

        if (pdfViewer) {
            initPdfViewer(pdfViewer);
        }

        if (!imagesScript || !gallery) {
            return;
        }

        var images = [];
        try {
            images = JSON.parse(imagesScript.textContent || '[]');
        } catch (error) {
            images = [];
        }

        if (!Array.isArray(images) || images.length === 0) {
            return;
        }

        var selectedIndex = 0;
        var originalOverflow = '';
        var lightbox = buildLightbox(images);
        var rootStyle = root.getAttribute('style') || '';

        if (rootStyle) {
            lightbox.element.setAttribute('style', rootStyle);
        }
        document.body.appendChild(lightbox.element);

        gallery.addEventListener('click', function (event) {
            var button = closest(event.target, '[data-ied-index]');
            if (!button || !gallery.contains(button)) {
                return;
            }

            openLightbox(Number(button.getAttribute('data-ied-index')) || 0);
        });

        function openLightbox(index) {
            selectedIndex = Math.max(0, Math.min(index, images.length - 1));
            originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            renderLightbox();
            lightbox.element.hidden = false;
            lightbox.close.focus();
            document.addEventListener('keydown', onKeyDown);
        }

        function closeLightbox() {
            lightbox.element.hidden = true;
            document.body.style.overflow = originalOverflow;
            document.removeEventListener('keydown', onKeyDown);
        }

        function nextPhoto() {
            selectedIndex = (selectedIndex + 1) % images.length;
            renderLightbox();
        }

        function prevPhoto() {
            selectedIndex = selectedIndex === 0 ? images.length - 1 : selectedIndex - 1;
            renderLightbox();
        }

        function onKeyDown(event) {
            if (event.key === 'Escape') {
                closeLightbox();
            } else if (event.key === 'ArrowRight') {
                nextPhoto();
            } else if (event.key === 'ArrowLeft') {
                prevPhoto();
            }
        }

        function renderLightbox() {
            var image = images[selectedIndex] || {};
            var fileName = image.file_name || '';
            var fileUrl = image.file_url || '';

            lightbox.heading.textContent = 'Photo ' + (selectedIndex + 1) + ' of ' + images.length;
            lightbox.filename.textContent = fileName;
            lightbox.filename.hidden = fileName === '';

            lightbox.stage.innerHTML = '';
            if (fileUrl) {
                var img = document.createElement('img');
                img.src = fileUrl;
                img.alt = fileName || 'Photo ' + (selectedIndex + 1);
                lightbox.stage.appendChild(img);
            } else {
                var span = document.createElement('span');
                span.textContent = 'Image not available';
                lightbox.stage.appendChild(span);
            }

            Array.prototype.forEach.call(lightbox.strip.querySelectorAll('button'), function (button, index) {
                button.classList.toggle('is-active', index === selectedIndex);
            });
        }

        lightbox.close.addEventListener('click', closeLightbox);
        lightbox.next.addEventListener('click', nextPhoto);
        lightbox.prev.addEventListener('click', prevPhoto);
        lightbox.strip.addEventListener('click', function (event) {
            var button = closest(event.target, 'button[data-ied-lightbox-index]');
            if (!button) {
                return;
            }

            selectedIndex = Number(button.getAttribute('data-ied-lightbox-index')) || 0;
            renderLightbox();
        });
    }

    function buildLightbox(images) {
        var element = document.createElement('div');
        element.className = 'ied-lightbox';
        element.hidden = true;
        element.setAttribute('role', 'dialog');
        element.setAttribute('aria-modal', 'true');

        element.innerHTML =
            '<div class="ied-lightbox-inner">' +
                '<div class="ied-lightbox-bar">' +
                    '<div class="ied-lightbox-title">' +
                        '<h2></h2>' +
                        '<span></span>' +
                    '</div>' +
                    '<button class="ied-lightbox-close" type="button" aria-label="Close lightbox">Close</button>' +
                '</div>' +
                '<div class="ied-lightbox-main">' +
                    '<div class="ied-lightbox-stage"></div>' +
                    '<div class="ied-lightbox-controls">' +
                        '<div class="ied-lightbox-nav">' +
                            '<button type="button" data-ied-prev>Previous</button>' +
                            '<button type="button" data-ied-next>Next</button>' +
                        '</div>' +
                        '<div class="ied-lightbox-strip"></div>' +
                    '</div>' +
                '</div>' +
            '</div>';

        var strip = element.querySelector('.ied-lightbox-strip');
        images.forEach(function (image, index) {
            var button = document.createElement('button');
            button.type = 'button';
            button.setAttribute('data-ied-lightbox-index', String(index));
            button.setAttribute('aria-label', 'View photo ' + (index + 1));

            if (image.file_url) {
                var img = document.createElement('img');
                img.src = image.file_url;
                img.alt = 'Thumbnail ' + (index + 1);
                button.appendChild(img);
            }

            var number = document.createElement('span');
            number.textContent = String(index + 1);
            button.appendChild(number);
            strip.appendChild(button);
        });

        return {
            element: element,
            heading: element.querySelector('.ied-lightbox-title h2'),
            filename: element.querySelector('.ied-lightbox-title span'),
            close: element.querySelector('.ied-lightbox-close'),
            stage: element.querySelector('.ied-lightbox-stage'),
            prev: element.querySelector('[data-ied-prev]'),
            next: element.querySelector('[data-ied-next]'),
            strip: strip
        };
    }

    function init() {
        Array.prototype.forEach.call(document.querySelectorAll('[data-ied-root]'), initRoot);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
