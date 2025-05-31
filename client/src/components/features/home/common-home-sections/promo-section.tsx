import Link from "next/link";
import { useRef } from "react";
import { motion} from "framer-motion";


export default function PromoSection() {
    const targetRef = useRef(null);
  return (
    <section ref={targetRef} className="bg-kc-text text-white py-16 px-6 md:px-20 text-center">
      <motion.div
      initial={{opacity: 0, y:50}}
            whileInView={{opacity: 1, y:0}}
            transition={{duration:1}}
       className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
          লিমিটলেস শেখার জন্য এখনি যুক্ত হোন কুষ্টিয়া চারুকলার সাথে
        </h2>
        <p className="text-lg md:text-xl mb-8 opacity-90">
          একটিমাত্র সাবস্ক্রিপশনে আপনার পছন্দের সকল কোর্স আনলক করুন। শেখা হোক আপনার প্রতিদিনের অভ্যাস!
        </p>

        <Link href="/login" >
        <button className="bg-white text-kc-text font-semibold text-lg px-8 py-3 rounded-full shadow-md hover:bg-kc-green hover:text-white transition">
          Join Now
        </button>
        </Link>

        
      </motion.div>
    </section>
  );
}
