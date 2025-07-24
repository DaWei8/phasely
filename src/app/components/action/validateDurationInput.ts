export function validateDurationInput(input: HTMLInputElement): void {
  const regex = /^(?:[3-9]|[1-9][0-9]|1[01][0-9]|120)$/;
  const error = document.getElementById("durationError");
  if (!regex.test(input.value)) {
    error?.classList.remove("hidden");
    input.classList.add("border-red-500");
  } else {
    error?.classList.add("hidden");
    input.classList.remove("border-red-500");
  }
}