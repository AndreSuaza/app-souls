export  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);

    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

export const pasteText = async () => {
    try {
        const clipboardText = await navigator.clipboard.readText();
        console.log(clipboardText);
        return (clipboardText);

    } catch (err) {
        
        console.error('Error al pegar texto:', err);

    }
}
