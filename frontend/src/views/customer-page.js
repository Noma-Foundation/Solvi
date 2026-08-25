import { NotCompleted } from "../utils/not-completed.js";
import { CustomerPageComponent } from "../components/customer/customer.js";


export function CustomerPage() {
    queueMicrotask(() => {
        new CustomerPageComponent();
    });
    return `<section class="customer-page"></section>`;
}