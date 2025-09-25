import { Toaster as Sonner } from "sonner";

export type { ExternalToast, ToastT } from "sonner";

export const Toaster = () => {
	return (
		<Sonner
			richColors
			closeButton
			position="top-right"
		/>
	);
};
