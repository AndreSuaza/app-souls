'use client';

import { redirect, usePathname, useSearchParams } from 'next/navigation';
import { ReactNode } from 'react';
import { PaginationLine } from './PaginationLine';


interface Props {
  children: ReactNode;
  totalPages: number;  
}


export const Pagination = ({ children, totalPages }: Props) => {

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pageString = searchParams.get('page') ?? 1;
  const currentPage = isNaN( +pageString ) ? 1 : +pageString;

  if (currentPage < 1 || isNaN(+pageString) ) {
    redirect( pathname );
  }
  
  return (
    <>
    <PaginationLine className='hidden sm:block' currentPage={currentPage} pathname={pathname} searchParams={searchParams} totalPages={totalPages}/>
    {children}
    <PaginationLine currentPage={currentPage} pathname={pathname} searchParams={searchParams} totalPages={totalPages}/>
    </>
    
  );
}