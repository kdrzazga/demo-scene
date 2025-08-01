function positionImageAtBottom() {
    const img = document.getElementById('rick');
    img.style.left = '0px';
    img.style.bottom = '0px';
}

window.addEventListener('load', positionImageAtBottom);
window.addEventListener('resize', positionImageAtBottom);
