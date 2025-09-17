'use client';

import { useAlertConfirmationStore } from "@/store";

interface Props { 
    text: string;
    className: string;
}

export const ConfirmationModal = ({ text, className }: Props) => {

    const closeAlertConfirmation = useAlertConfirmationStore( state => state.closeAlertConfirmation );
    const runAction = useAlertConfirmationStore( state => state.runAction );

  return (
    <>

    <div
        className="fixed top-0 left-0 w-screen h-screen z-10 bg-black opacity-30"
    />



    <div 
        onClick={ closeAlertConfirmation }
        className="fade-in fixed top-0 left-0 w-screen h-screen z-10 backdrop-filter backdrop-blur-sm"
    />

    <div className={`fixed ${className}`}>
        <div className="flex flex-col">
            <p className="mt-4 px-20 text-center">
            {text}
            </p>
            <div className="mx-auto mt-4">
                <button 
                    onClick={runAction}
                    className="btn-primary mr-2 capitalize"
                >Sí, confirmar</button>
                <button 
                    onClick={closeAlertConfirmation}
                    className="btn-warning capitalize"
                >Cancelar</button>
            </div>
        </div>
    </div> 
    </>
  )
}
