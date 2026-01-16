export type WayForPayFormPayload = {
  action: string;
  fields: Record<string, unknown>;
};

let isSubmittingForm = false;

export function submitWayForPayForm(action: string, fields: Record<string, unknown>) {
  if (isSubmittingForm) {
    return;
  }

  try {
    isSubmittingForm = true;

    const form = document.createElement("form");
    form.method = "POST";
    form.action = action;
    form.style.display = "none";

    Object.entries(fields).forEach(([key, val]) => {
      if (Array.isArray(val)) {
        val.forEach((v) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = `${key}[]`;
          input.value = String(v);
          form.appendChild(input);
        });
        return;
      }

      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = String(val ?? "");
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  } catch (error) {
    console.error("[WayForPay] Помилка створення форми:", error);
    isSubmittingForm = false;
    throw error;
  }
}

