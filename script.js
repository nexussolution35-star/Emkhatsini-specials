const slides = document.querySelectorAll(".slide");
const dots = document.querySelectorAll(".dot");
const prevBtn = document.querySelector(".nav.prev");
const nextBtn = document.querySelector(".nav.next");

let current = 0;
let timer = null;

function showSlide(index) {
  slides[current].classList.remove("active");
  dots[current].classList.remove("active");
  current = (index + slides.length) % slides.length;
  slides[current].classList.add("active");
  dots[current].classList.add("active");
}

function nextSlide() {
  showSlide(current + 1);
}

function resetTimer() {
  clearInterval(timer);
  timer = setInterval(nextSlide, 5000);
}

prevBtn.addEventListener("click", () => {
  showSlide(current - 1);
  resetTimer();
});

nextBtn.addEventListener("click", () => {
  showSlide(current + 1);
  resetTimer();
});

dots.forEach((dot) => {
  dot.addEventListener("click", () => {
    showSlide(parseInt(dot.dataset.index, 10));
    resetTimer();
  });
});

resetTimer();
