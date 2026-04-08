import { useEffect, useRef } from "react";

/**
 * Hook to reveal/hide elements on scroll using IntersectionObserver.
 * Adds "revealed" when entering viewport, removes it when leaving.
 *
 * @param {Object} options
 * @param {number} options.threshold - 0–1, how much visible before triggering (default 0.15)
 * @param {string} options.rootMargin - margin around root (default "0px 0px -60px 0px")
 */
export default function useScrollReveal({ threshold = 0.15, rootMargin = "0px 0px -60px 0px" } = {}) {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add("revealed");
                } else {
                    el.classList.remove("revealed");
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold, rootMargin]);

    return ref;
}
