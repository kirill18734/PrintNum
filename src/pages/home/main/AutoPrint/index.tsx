import ShowPaper from "@/components/showPaper";
import { useAppStore } from "@/services/store";

export function AutoPrint() {
  //get
  const idNum = useAppStore((state) => state.idNum);
  const endLine = useAppStore((state) => state.endLine);
  const bold = useAppStore((state) => state.bold);
  const hybrid = useAppStore((state) => state.hybrid);
  const expand = useAppStore((state) => state.expand);
  //change

  const setSetting = useAppStore((state) => state.setSetting);
  const changeIdNum = (newIdNum: boolean) => setSetting("idNum", newIdNum);
  const changeBold = (newBold: boolean) => setSetting("bold", newBold);
  const changeHybrid = (newHybrid: boolean) => setSetting("hybrid", newHybrid);

  const changeEndLine = (newEndLine: boolean) =>
    setSetting("endLine", newEndLine);
  const changeExpand = (newExpand: number | "") =>
    setSetting("expand", newExpand);


  
  
  return (
    <>
      <ShowPaper
        defaultIdNum={idNum}
        setDefaultIdNum={changeIdNum}
        defaultEndLine={endLine}
        setDefaultEndLine={changeEndLine}
        defaultBold={bold}
        setDefaultBold={changeBold}
        defaultHybrid={hybrid}
        setDefaultHybrid={changeHybrid}
        defaultExpand={expand}
        setDefaultExpand={changeExpand}
        preview={preview}
        singleColumn
      />
    </>
  );
}
