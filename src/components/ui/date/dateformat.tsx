import React from 'react'

export const Dateformat = ({fecha}:{fecha:Date}) => {

  const formato = fecha.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return <span>{formato}</span>;    
}