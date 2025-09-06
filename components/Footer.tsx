import React from 'react'
import Image from 'next/image'
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react'
import Link from 'next/link'
import { Heading } from './ui/heading'
// import logo from '@/public/'

const Footer = () => {
  return (
    <footer className='w-full min-h-[20vh] bg-gray-200 p-10'>
        <div className='w-full h-full flex items-center justify-start gap-[7rem] flex-wrap'>
            <div>
                <Image src="/TeeSpace.png" alt='logo' width={200} height={200} />
                <div className='flex items-center justify-start gap-2 mt-8'>
                    <Link href="https://www.twitter.com/">
                        <Twitter className='text-gray-400 hover:text-primary-green transition-all duration-300'/>
                    </Link>
                    <Link href="http://www.facebook.com/">
                        <Facebook className='text-gray-400 hover:text-primary-green transition-all duration-300'/>
                    </Link>
                    <Link href="http://www.youtube.com/">
                        <Youtube className='text-gray-400 hover:text-primary-green transition-all duration-300'/>
                    </Link>
                    <Link href="https://www.instagram.com/">
                        <Instagram className='text-gray-400 hover:text-primary-green transition-all duration-300'/>
                    </Link>
                </div>
            </div>
            <div>
                <Heading as='h4'>Get In Touch</Heading>
                <ul className='flex flex-col gap-2 mt-4 text-gray-400'>
                    <li>hello@teespace.io</li>
                    <li>+02 036 038 3996</li>
                    <li>3665 Paseo Place, Suite</li>
                    <li>0960 San Diego</li>
                </ul>
            </div>
            <div>
                <Heading as='h4'>Quick Links</Heading>
                <ul className='flex flex-col gap-2 mt-4 text-gray-400'>
                    <Link href="/about">
                        <li className='hover:text-primary-green transition-all duration-300'>About</li>
                    </Link>
                    <Link href="/shop">
                        <li className='hover:text-primary-green transition-all duration-300'>Shop</li>
                    </Link>
                    <Link href="/contact-us">
                        <li className='hover:text-primary-green transition-all duration-300'>Contact Us</li>
                    </Link>
                </ul>
            </div>
        </div>
        <div className='w-full mt-4 flex items-center justify-center'>
            <p className='text-gray-400 font-medium'>Terms & Conditions Privacy Policy© 2022 TeeSpace</p>
        </div>
    </footer>
  )
}

export default Footer
