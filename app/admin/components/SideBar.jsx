"use client"
import Link from 'next/link'
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BedroomParentIcon from '@mui/icons-material/BedroomParent';
import { usePathname } from 'next/navigation';

export default function SideBar() {
    const pathname = usePathname()
    const adminNavLinks = [
        { href: '/admin', icon: <DashboardIcon/>, label: 'Dashboard' },
        { href: '/admin/bookings', icon: <MenuBookIcon/>, label: 'Bookings' },
        { href: '/admin/hotels', icon: <BedroomParentIcon/>, label: 'Hotels' },

    ];

    return (
        <div className='h-[calc(100vh-72px)] bg-white border-r'>
            <ul className='text-[#515151] mt-5'>
                {
                    adminNavLinks.map((link, index) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link prefetch={true} key={index} href={link.href} className={`flex items-center gap-3 px-3 py-3.5 md:px-9 md:min-w-72 cursor-pointer hover:bg-[#f2f3ff] transition-all ${isActive ? 'bg-[#f2f3ff] border-r-4 border-[#5f6fff] [&_span]:text-[#5f6fff] [&_p]:text-[#5f6fff]' : '' }`}>
                                <span>{link.icon}</span>
                                <p className='hidden md:block'>{link.label}</p>
                            </Link>
                        )
                    })
                }
            </ul>
        </div>
    )
}