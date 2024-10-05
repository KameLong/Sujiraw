import {ReactElement, useEffect, useRef, useState} from "react";

interface BoxListProps {
    itemCount:number;
    children:(index:number,style:any)=>ReactElement<any, any>;
    itemSize:number;
    onScroll?:(scrollX:number,scrollY:number)=>void;
    getSetScrollX?:(setScroll:(scrollX:number)=>void)=>void;
}


export function HolizontalBoxList({children,itemCount,itemSize,onScroll,getSetScrollX}: BoxListProps){
    const ref = useRef<HTMLDivElement | null>(null);
    const [scrollX,setScrollX]=useState(-1);
    useEffect(() => {
        if (ref.current) {
            ref.current.onresize = (e) => {
                setScrollX(ref.current?.scrollLeft);
            }
            ref.current.onscroll = (e) => {
                if(onScroll){
                    onScroll(ref.current?.scrollLeft??0,ref.current?.scrollTop??0);
                }
                if(scrollX!==ref.current?.scrollLeft){
                    setScrollX(ref.current?.scrollLeft);
                }
            }
        }
        setScrollX(0);
    }, []);

    const setScroll=(scrollX:number)=>{
        setScrollX(scrollX);
        if (ref.current) {
            ref.current.scrollLeft=scrollX;
        }
    }
    if(getSetScrollX!==undefined){
        getSetScrollX(setScroll);
    }
    const startIndex=Math.min(itemCount,Math.max(0,Math.floor(scrollX/itemSize)-5));
    const endIndex=Math.min(itemCount,Math.ceil((scrollX+(ref.current?.offsetWidth??0))/itemSize)+5);
    return (
        <div
            ref={ref}
            style={{
            width:'100%',
            overflowX: 'auto',
            height : '100%',
        }
        }>

        <div style={{
            position: 'relative',
            width:itemCount*itemSize,
        }}>
            {
                Array(endIndex-startIndex).fill(0).map((_, i) => {
                return(
                children(i+startIndex,{position: 'absolute', left: itemSize*(i+startIndex)})
                );
            })
            }
        </div>
        </div>
    )
}