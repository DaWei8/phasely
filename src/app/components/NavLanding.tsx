import Image from "next/image"
import Link from "next/link"
import { switchTab } from "./nav/switchTab"

export const NavLanding = () => {
    return (
        <nav className="sticky top-0 block items-end w-full z-10">
            <div
                className="px-2 md:px-4 lg:px-6 py-4 pt-6 backdrop-blur-md bg-opacity-60 bg-white mx-auto flex justify-between items-center"
            >
                <Link href="#" className="text-2xl font-bold text-gray-800">
                    <Image
                        src="assets/phasely-logo-2.svg"
                        alt="Company Logo"
                        className="w-24"
                        width={24}
                        height={60}
                    />
                </Link>
                <div className="flex">
                    <button
                        title="Toggle mobile menu"
                        id="mobile-menu-button"
                        className="hamburger-menu focus:outline-none"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>

            <div
                id="mobile-menu"
                className=" bg-transparent absolute right-1 float-right mr-4 flex flex-col items-center space-y-3 mt-4"
            >
                <div
                    className="w-64 h-fit flex flex-col gap-3 p-4 rounded-xl shadow-2xl bg-white"
                >
                    <button
                        id="historyTab"
                        className="px-2 py-4 flex gap-2 items-center rounded-lg bg-gray-50 font-medium text-gray-900 hover:text-blue-600"
                        onClick={() => switchTab("history")} // ← fix
                    >
                        <i className="fas fa-history"></i>View History
                    </button>

                    <button
                        id="templateTab"
                        className="px-2 py-4 flex gap-2 items-center rounded-lg bg-gray-50 font-medium text-gray-900 hover:text-blue-600"
                        onClick={() => switchTab("template")} // ← fix
                    >
                        <i className="fas fa-layer-group"></i>Use Templates
                    </button>
                </div>
            </div>
        </nav>
    )
}


