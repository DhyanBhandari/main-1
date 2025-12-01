import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import emailjs from "@emailjs/browser";
import { X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const formSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits"),
    description: z.string().min(20, "Description must be at least 20 characters").max(200, "Description must not exceed 200 characters"),
    email: z.string().email("Invalid email address"),
    organisationType: z.string().default("Partners"),
});

type FormData = z.infer<typeof formSchema>;

interface PartnerFormModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PartnerFormModal = ({ isOpen, onClose }: PartnerFormModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            mobileNumber: "",
            description: "",
            email: "",
            organisationType: "Partners",
        },
    });

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {

            const serviceId = "service_vrkgntv";
            const templateId = "template_w55cwz4";
            const publicKey = "7dq3BYGeqRCO8c5zJ";

            await emailjs.send(
                serviceId,
                templateId,
                {
                    to_name: "Erthaloka Team",
                    from_name: data.fullName,
                    reply_to: data.email,
                    mobile_number: data.mobileNumber,
                    organisation_type: data.organisationType,
                    message: data.description,
                },
                publicKey
            );

            console.log("Form Data:", data);
            toast.success("Request sent successfully!");
            form.reset();
            onClose();
        } catch (error: any) {
            console.error("EmailJS Error:", error);
            if (error.status === 422) {
                toast.error("Failed to send: Please check your EmailJS template variables.");
            } else {
                toast.error("Failed to send request. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-45%" }}
                        animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                        exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-45%" }}
                        className="fixed left-[50%] top-[50%] z-50 w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Partner With Us</h2>
                            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                <input
                                    {...form.register("fullName")}
                                    className={cn(
                                        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                        form.formState.errors.fullName && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                    placeholder="Enter your full name"
                                />
                                {form.formState.errors.fullName && (
                                    <p className="text-xs text-red-500">{form.formState.errors.fullName.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Number</label>
                                <input
                                    {...form.register("mobileNumber")}
                                    className={cn(
                                        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                        form.formState.errors.mobileNumber && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                    placeholder="Enter your mobile number"
                                />
                                {form.formState.errors.mobileNumber && (
                                    <p className="text-xs text-red-500">{form.formState.errors.mobileNumber.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email ID</label>
                                <input
                                    {...form.register("email")}
                                    type="email"
                                    className={cn(
                                        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                        form.formState.errors.email && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                    placeholder="Enter your email address"
                                />
                                {form.formState.errors.email && (
                                    <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type of Organisation</label>
                                <select
                                    {...form.register("organisationType")}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled
                                >
                                    <option value="Partners">Partners</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description / Message</label>
                                <textarea
                                    {...form.register("description")}
                                    className={cn(
                                        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                        form.formState.errors.description && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                    placeholder="Briefly describe your partnership proposal..."
                                />
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Min 20 chars</span>
                                    <span>{form.watch("description")?.length || 0}/200</span>
                                </div>
                                {form.formState.errors.description && (
                                    <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>
                                )}
                            </div>

                            <Button type="submit" className="w-full bg-green-800 hover:bg-green-900 text-white" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    "Submit Request"
                                )}
                            </Button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
