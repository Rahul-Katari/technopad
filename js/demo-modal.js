// demo-modal.js

document.addEventListener("DOMContentLoaded", () => {
  /* -----------------------------
     1️⃣ INJECT MODAL HTML
  ------------------------------*/
  const modalHTML = `
  <div
    id="demoModal"
    class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50"
  >
    <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
      <h3 id="modalTitle" class="text-xl font-bold mb-4">Request a Demo</h3>
      <form id="demoForm">
        <!-- Hidden fields for lead tracking -->
        <input type="hidden" name="source" id="leadSource">
        <input type="hidden" name="page" id="leadPage">

        <div class="grid grid-cols-1 gap-6">
          <div>
            <label for="name" class="block text-gray-700 font-medium">Name*</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              class="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Your Name"
            />
          </div>
          <div>
            <label for="mobile" class="block text-gray-700 font-medium">Mobile*</label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              required
              maxlength="10"
              minlength="10"
              pattern=".{10,}"
              oninput="validateMobileNumber(this)"
              title="Please Enter a Valid Mobile Number"
              class="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Mobile"
            />
          </div>
          <div>
            <label for="email" class="block text-gray-700 font-medium">Email*</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              class="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Email"
            />
          </div>
          <p id="brochure-form-status" class="text-red-600"></p>
          <div class="flex justify-end">
            <button
              type="button"
              onclick="closeModal()"
              class="px-4 py-2 bg-gray-300 rounded-lg mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="brochure-form-button"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);

  /* -----------------------------
     2️⃣ CACHE ELEMENTS
  ------------------------------*/
  const modal = document.getElementById("demoModal");
  const form = document.getElementById("demoForm");
  const leadSourceInput = document.getElementById("leadSource");
  const leadPageInput = document.getElementById("leadPage");

  if (!modal || !form) return;

  /* -----------------------------
     3️⃣ OPEN MODAL FROM BUTTONS
  ------------------------------*/
  document.querySelectorAll(".open-demo").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      leadSourceInput.value = btn.dataset.source || "Unknown";
      leadPageInput.value =
        window.location.pathname.substring(1) === ""
          ? "Home Page"
          : window.location.pathname.substring(1);

      modal.classList.remove("hidden");
      document.body.classList.add("overflow-hidden");
    });
  });

  /* -----------------------------
     4️⃣ CLOSE MODAL
  ------------------------------*/
  window.closeModal = function () {
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
    form.reset();
  };

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });

  /* -----------------------------
     5️⃣ FORM SUBMISSION
  ------------------------------*/

  function hasPaidAttribution(attr) {
    return Boolean(attr?.gclid || attr?.fbclid);
  }

  function getAttributionData() {
    try {
      const ls = localStorage.getItem("paid_attribution_v1");
      if (ls) return JSON.parse(ls);
    } catch (e) {}

    try {
      const ss = sessionStorage.getItem("paid_attribution_v1");
      if (ss) return JSON.parse(ss);
    } catch (e) {}

    if (window.__PAID_ATTR__) return window.__PAID_ATTR__;

    return {};
  }

  let isSubmitting = false;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    // 🚫 Block duplicate submits
    if (isSubmitting) return;
    isSubmitting = true;

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = "Submitting...";
    }

    const formData = new FormData(form);
    const attribution = getAttributionData();
    if (hasPaidAttribution(attribution)) {
      // Explicitly append tracking fields
      formData.append("gclid", attribution.gclid || "");
      formData.append("fbclid", attribution.fbclid || "");
      formData.append("utm_source", attribution.utm_source || "");
      formData.append("utm_medium", attribution.utm_medium || "");
      formData.append("utm_campaign", attribution.utm_campaign || "");
      formData.append("utm_term", attribution.utm_term || "");
      formData.append("utm_content", attribution.utm_content || "");
      formData.append(
        "first_paid_visit_ts",
        attribution.first_paid_visit_ts || "",
      );
      formData.append("landing_page", attribution.landing_page || "");
    } else {
      // Ensure columns exist even if no paid attribution
      formData.append("gclid", "");
      formData.append("fbclid", "");
      formData.append("utm_source", "");
      formData.append("utm_medium", "");
      formData.append("utm_campaign", "");
      formData.append("utm_term", "");
      formData.append("utm_content", "");
      formData.append("first_paid_visit_ts", "");
      formData.append("landing_page", "");
    }

    fetch(
      "https://script.google.com/macros/s/AKfycby-XVBEVJpUkDoQMp91Yr-q28tlLoNdpMJEweDwCFT1BIHzp9nc1wgLquDQ3jEaq7CYUg/exec",
      {
        method: "POST",
        body: formData,
        mode: "no-cors",
      },
    )
      .then(() => {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "form_success",
          form_id: "demoForm",
        });

        console.log("Form Submitted Successfully");

        form.reset();
        closeModal();

        window.location.href = "/thank-you";
      })
      .catch((error) => {
        console.error("Error submitting form:", error);
        isSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = "Submit";
        }
      });
  });
});
