const scrollLeftMin = -300;
const scrollLeftMax = 1500;

mainScroll(){
    let scrollImg = document.getElementById('scroll');
    if (scrollImg.left > scrollLeftMin){
        scrollImg.left = scrollImg.left - 1;
    }
    else{
        scrollImg.left = scrollLeftMax;
    }
}
