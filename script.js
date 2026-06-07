document.addEventListener('DOMContentLoaded', function() {
    const cases = document.querySelectorAll('.portfolio-case');
    const detailView = document.getElementById('detail-view');
    const detailMedia = document.getElementById('detail-media');
    const detailTitle = document.getElementById('detail-title');
    const detailDesc = document.getElementById('detail-desc');
    const backBtn = document.getElementById('detail-back');

    function createMediaElement(resource, desc) {
        if (!resource) {
            const div = document.createElement('div');
            div.className = 'text-block';
            div.textContent = desc || 'No preview available.';
            return div;
        }

        const url = String(resource).trim();
        const lower = url.toLowerCase();

        if (lower.endsWith('.pdf')) {
            const iframe = document.createElement('iframe');
            iframe.src = url;
            iframe.title = desc || 'PDF Preview';
            iframe.setAttribute('loading', 'lazy');
            return iframe;
        }

        if (lower.match(/\.(png|jpe?g|gif|webp|svg)$/)) {
            const img = document.createElement('img');
            img.src = url;
            img.alt = desc || '';
            img.loading = 'lazy';
            return img;
        }

        if (lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('//')) {
            const iframe = document.createElement('iframe');
            iframe.src = url;
            iframe.title = desc || 'Embedded content';
            iframe.setAttribute('loading', 'lazy');
            return iframe;
        }

        const div = document.createElement('div');
        div.className = 'text-block';
        div.textContent = desc || resource;
        return div;
    }

    function openDetail(dataSource) {
        const title = dataSource.title || 'Untitled';
        const desc = dataSource.desc || '';
        const resource = dataSource.resource || dataSource.link || dataSource.image || '';
        detailTitle.textContent = title;
        const paragraphs = desc.split('\n\n').filter(p => p.trim());
        detailDesc.innerHTML = paragraphs.map(p => `<p>${p.trim()}</p>`).join('');

        detailMedia.innerHTML = '';
        const mediaEl = createMediaElement(resource, desc);
        detailMedia.appendChild(mediaEl);

        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        if (scrollbarWidth > 0) {
            document.body.dataset.prevPaddingRight = document.body.style.paddingRight || '';
            const current = parseFloat(getComputedStyle(document.body).paddingRight) || 0;
            document.body.style.paddingRight = (current + scrollbarWidth) + 'px';
        }

        detailView.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        document.body.classList.add('detail-open');
    }

    function closeDetail() {
        detailView.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        document.body.classList.remove('detail-open');
        if (document.body.dataset.prevPaddingRight !== undefined) {
            document.body.style.paddingRight = document.body.dataset.prevPaddingRight;
            delete document.body.dataset.prevPaddingRight;
        } else {
            document.body.style.paddingRight = '';
        }
        detailMedia.innerHTML = '';
    }

    cases.forEach(c => {
        const imageArea = c.querySelector('.image-area');
        const hiddenImage = c.querySelector('.hidden-image');
        const imageUrl = hiddenImage ? hiddenImage.src : c.dataset.image;
        if (imageArea && imageUrl) {
            const img = document.createElement('img');
            img.src = imageUrl;
            const hiddenTitle = c.querySelector('.hidden-title');
            img.alt = hiddenTitle ? hiddenTitle.textContent : (c.dataset.title || '');
            imageArea.appendChild(img);
        }

        c.addEventListener('click', function(e) {
            const hiddenTitle = this.querySelector('.hidden-title');
            const hiddenDescs = this.querySelectorAll('.hidden-description');
            const hiddenImage = this.querySelector('.hidden-image');
            const hiddenLink = this.querySelector('.hidden-link');
            const displayType = this.querySelector('.hidden-display-type');

            if (this.dataset.navOnClick === 'true' && hiddenLink && hiddenLink.href) {
                window.location.href = hiddenLink.href;
                return;
            }

            let combinedDesc = '';
            hiddenDescs.forEach((desc, index) => {
                if (index > 0) combinedDesc += '\n\n';
                combinedDesc += desc.textContent;
            });
            
            let contentToDisplay = hiddenImage ? hiddenImage.src : '';
            if (displayType && displayType.value === 'pdf') {
                contentToDisplay = hiddenLink ? hiddenLink.href : '';
            }
            
            const data = {
                title: hiddenTitle ? hiddenTitle.textContent : (this.dataset.title || ''),
                desc: combinedDesc || (this.dataset.desc || ''),
                image: hiddenImage ? hiddenImage.src : (this.dataset.image || ''),
                link: hiddenLink ? hiddenLink.href : (this.dataset.link || ''),
                resource: contentToDisplay
            };
            openDetail(data);
        });
    });

    backBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeDetail();
    });

    detailView.addEventListener('click', function(e) {
        if (e.target === detailView) closeDetail();
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && detailView.getAttribute('aria-hidden') === 'false') {
            closeDetail();
        }
    });

});
