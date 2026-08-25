"use strict";

const allSlides = document.querySelectorAll(".slide");
const nextBtn2 = document.querySelector(".nextBtn2");
const nextBtn1 = document.querySelector(".nextBtn1");
const slide1 = document.getElementById('slide1');
const slide2 = document.getElementById('slide2');
console.log(allSlides);

allSlides[0].style.opacity = 1;

let currentSlide = 0;

function moveSlide() {
  if (currentSlide === allSlides.length) {
    currentSlide = 0;
  }

  for (let i = 0; i < allSlides.length; i++) {
    const eachSlide = allSlides[i];

    eachSlide.style.opacity = 0;

    allSlides[currentSlide].style.opacity = 1;
  }

  currentSlide++;
}
nextBtn2.addEventListener("click", moveSlide);


slide1