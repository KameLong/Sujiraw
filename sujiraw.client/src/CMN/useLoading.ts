import {useState} from "react";

/**
 * ローディング管理
 */
export function useLoading(){
    const [loading,setLoading]=useState<boolean>(false);
    function startLoading(){
        setLoading(true);
    }
    function stopLoading(){
        setLoading(false);
    }
    return {loading,startLoading,stopLoading};
}
