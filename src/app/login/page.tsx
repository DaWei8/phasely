// app/login/page.tsx
"use client"

import { useEffect } from "react"
import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { createClient } from "@/lib/supabase"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

export default function AuthPage() {
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth event:', event, 'Session:', session)

                if (event === "SIGNED_IN") {
                    router.push("/dashboard")
                    toast.success("Logged in successfully!")
                    router.refresh() // Refresh to update server components
                }

                if (event === "SIGNED_OUT") {
                    router.push("/login")
                    router.refresh()
                }
            }
        )

        return () => {
            authListener?.subscription.unsubscribe()
        }
    }, [router, supabase])

    return (
        <div className="bg-gray-100 w-screen h-screen flex flex-col items-center px-4 justify-center">
            <div className="max-w-lg bg-white w-full shadow-lg p-4 pt-8 lg:p-8 rounded-2xl">
                <h1 className="text-3xl md:text-4xl text-black mb-4 font-extrabold text-center">
                    Login to Phasely
                </h1>
                <p className="text-center text-[15px] text-gray-600 mb-2">
                    Start creating personalized learning schedules with AI assistance
                </p>

                <Auth
                    supabaseClient={supabase}
                    providers={["facebook","google"]}
                    appearance={{
                        theme: ThemeSupa,
                        variables: {
                            default: {
                                colors: {
                                    brand: "#2563EB",
                                    brandAccent: "#2563EB",
                                    brandButtonText: "#ffffff",
                                    defaultButtonBackground: "#f3f4f6",
                                    defaultButtonBackgroundHover: "#e5e7eb",
                                    inputBackground: "#ffffff",
                                    inputBorder: "#d1d5db",
                                    inputBorderHover: "#9ca3af",
                                    inputBorderFocus: "#2563EB",
                                    inputText: "#111827",
                                },
                                fonts: {
                                    bodyFontFamily: "Poppins, sans-serif",
                                    buttonFontFamily: "Poppins, sans-serif",
                                    inputFontFamily: "Poppins, sans-serif",
                                    labelFontFamily: "Poppins, sans-serif",
                                },
                                fontSizes: {
                                    baseBodySize: "15px",
                                    baseButtonSize: "15px",
                                    baseInputSize: "15px",
                                    baseLabelSize: "15px",
                                },
                                space: {
                                    anchorBottomMargin: "16px",
                                    inputPadding: "12px 16px",
                                    buttonPadding: "12px 16px",
                                    labelBottomMargin: "8px",
                                    emailInputSpacing: "8px",
                                    socialAuthSpacing: "8px",
                                },
                            },
                        },
                    }}
                    localization={{
                        variables: {
                            sign_in: {
                                email_label: "Email",
                                password_label: "Password (min 6 chars)",
                                button_label: "Sign in",
                            },
                            sign_up: {
                                email_label: "Email",
                                password_label: "Create password",
                                button_label: "Create account",
                            },
                        },
                    }}
                    showLinks={true}
                    redirectTo={`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`}
                />
            </div>
        </div>
    )
}