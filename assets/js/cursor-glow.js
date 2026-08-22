(() => {
  if (window.matchMedia("(pointer: coarse)").matches) return;

  const main = document.querySelector("main");
  if (!main) return;

  /*
   * The cursor glow is the ONLY orange glow on the page.
   * No ambient/background orbs are created here.
   *
   * Protected sections:
   * - "Non faccio solo montaggio."  -> section.no-grid
   * - "Mandami il materiale."       -> section.contact
   *
   * The glow is hidden whenever its 150px area would touch one
   * of those sections, so it can never visually cross over them.
   */
  const protectedSections = [
    ...document.querySelectorAll("section.no-grid, section.contact")
  ];

  const cursor = document.createElement("div");
  cursor.className = "cursor-orb";
  cursor.setAttribute("aria-hidden", "true");
  main.appendChild(cursor);

  let mouseX = innerWidth / 2;
  let mouseY = innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;

  window.addEventListener("pointermove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    cursor.classList.add("is-visible");
  }, { passive: true });

  window.addEventListener("pointerleave", () => {
    cursor.classList.remove("is-visible");
  });

  const cursorTouchesProtectedSection = () => {
    const radius = 75;
    const left = cursorX - radius;
    const right = cursorX + radius;
    const top = cursorY - radius;
    const bottom = cursorY + radius;

    return protectedSections.some((section) => {
      const rect = section.getBoundingClientRect();

      return (
        right > rect.left &&
        left < rect.right &&
        bottom > rect.top &&
        top < rect.bottom
      );
    });
  };

  const animate = () => {
    /* Smooth physical follow — preserves the approved mouse glow. */
    cursorX += (mouseX - cursorX) * 0.17;
    cursorY += (mouseY - cursorY) * 0.17;

    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;

    /*
     * Hide the entire glow before it can overlap a protected
     * section. This is intentionally based on the glow's radius,
     * not only the pointer position.
     */
    cursor.classList.toggle(
      "is-suppressed",
      cursorTouchesProtectedSection()
    );

    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);

  window.addEventListener("resize", () => {
    mouseX = Math.min(mouseX, innerWidth);
    mouseY = Math.min(mouseY, innerHeight);
  });
})();
