'use strict';

function getGrayScale(src, width, height) {
    const count = width * height;
    const dst = new Uint8Array(count);

    for (let p = 0; p < count; ++p) {
        const ps = p * 4;
        dst[p] = (src[ps] + src[ps + 1] + src[ps + 2]) / 3 | 0;
    }
    return dst;
}

function getDilation(src, width, height) {
    const dst = new Uint8Array(width * height);
    for (let x = 0; x < width; ++x) {
        dst[x] = src[x];
    }
    let pos = width;
    for (let y = 1; y < height - 1; ++y) {
        dst[pos] = src[pos];
        for (let x = 1; x < width - 1; ++x) {
            let max = src[pos + x];
            let p = pos + x - width - 1;
            if (max < src[p]) {
                max = src[p];
            }
            if (max < src[++p]) {
                max = src[p];
            }
            if (max < src[++p]) {
                max = src[p];
            }
            p += width - 2;
            if (max < src[p]) {
                max = src[p];
            }
            if (max < src[p + 2]) {
                max = src[p + 2];
            }
            p += width;
            if (max < src[p]) {
                max = src[p];
            }
            if (max < src[++p]) {
                max = src[p];
            }
            if (max < src[++p]) {
                max = src[p];
            }
            dst[pos + x] = max;
        }
        dst[pos + width - 1] = src[pos + width - 1];
        pos += width;
    }
    for (let x = 0; x < width; ++x) {
        dst[pos + x] = src[pos + x];
    }
    return dst;
}

function makeDiff(gs, dil, count) {
    const dst = new Uint8Array(count);
    for (let p = 0; p < count; ++p) {
        dst[p] = 255 - Math.abs(dil[p] - gs[p]);
    }
    return dst;
}

function drawArray(ctx, src, arr) {
    const s = src.data;
    let poss = 0;
    let posa = 0;
    for (let y = 0; y < src.height; ++y) {
        for (let x = 0; x < src.width; ++x) {
            const p = poss + x * 4;
            s[p] = s[p + 1] = s[p + 2] = arr[posa + x];
        }
        poss += src.width * 4;
        posa += src.width;
    }
    ctx.putImageData(src, 0, 0, 0, 0, src.width, src.height);
}

function proc(imgpath) {
    const src = document.getElementById('src');
    const dst = document.getElementById('dst');
    const sctx = src.getContext('2d');
    const dctx = dst.getContext('2d');
    const img = new Image();
    img.onload = function(){
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        src.width = dst.width = w;
        src.height = dst.height = h;
        sctx.drawImage(img, 0, 0);
        const data = sctx.getImageData(0, 0, w, h);
        const gs = getGrayScale(data.data, w, h);
        const dil = getDilation(gs, w, h);
        const diff = makeDiff(gs, dil, w * h);
        drawArray(dctx, data, diff);
    };
    img.src = imgpath;
}

(function(d){
    const file = d.querySelector('.file');
    const dl = d.querySelector('.dl');
    file.addEventListener('change', function(){
        if (this.files.length === 0) return;
        const r = new FileReader();
        r.onload = function(e) {
            proc(e.target.result);
            dl.classList.add('show');
        }
        r.readAsDataURL(this.files[0]);
    });
    dl.addEventListener('click', function(){
        const a = d.createElement('a');
        a.href = d.getElementById('dst').toDataURL('image/png');
        a.download = 'nurie.png';
        a.click();
    });
})(document);