import CmnNavbar from "@/components/common/navigation/cmn-navbar";
import CmnHeroBanner from "./common-home-sections/cmn-hero-banner";
import PurposeSection from "./common-home-sections/purpose-section";
import CourseSection from "./common-home-sections/course-section";
import PromoSection from "./common-home-sections/promo-section";
import MentorsSection from "./common-home-sections/mentors-section";
import ArtworkGallerySection from "./common-home-sections/artwork-gallery-section";

const CommonHomePage = () => {
  return (
    <div>
      <CmnNavbar />
      <CmnHeroBanner />
      <PurposeSection />
      <CourseSection />
      <ArtworkGallerySection />
      <MentorsSection />
      <PromoSection />
    </div>
  );
};

export default CommonHomePage;
