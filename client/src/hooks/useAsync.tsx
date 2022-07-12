import { useEffect } from "react";

function useAsync(asyncFn: () => any, onSuccess: (data: any) => void): void {
    useEffect(() => {
      let isActive = true;
      asyncFn().then((data: any) => {
        if (isActive) onSuccess(data);
      });
      return () => { isActive = false };
    }, [asyncFn, onSuccess]);
}

export const withAsync = (asyncFn: () => any, onSuccess: (data: any) => void) => {
    return () => {
        useAsync(asyncFn, onSuccess);
    }
}

export default useAsync;
