import {createRef, useEffect} from "react";
import styles from "./timetable.module.scss";

export function MatchTextLabel({children}){
    const ref=createRef<HTMLSpanElement>();
    useEffect(() => {
        console.log(ref.current, ref.current.parentElement);
        const element = ref.current;
        console.log(element.parentElement.offsetWidth,element.offsetWidth)
        if (element && element.parentElement, element.offsetWidth) {
            const scale = Math.min(1, (element.parentElement.offsetWidth-2) / element.offsetWidth);
            console.log(scale);
            element.style.transform = `scaleX(${scale})`;
        }
    }, [children]);

    return <span style={{display:"inline-block"}} className={styles.matchTextLabel} ref={ref}>
        {children}
    </span>

}