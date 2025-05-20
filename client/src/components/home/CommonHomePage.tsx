import React from 'react';
import CmnNavbar from '../shared/navbars/CmnNavbar';
import CmnHeroBanner from '../banners/CmnHeroBanner';
import PurposeSection from './commonHomeSections/PurposeSection';
import CourseSection from './commonHomeSections/CourseSection';
import ArtworkGallerySection from './commonHomeSections/ArtworkGallerySection';
import MentorsSection from './commonHomeSections/Mentors';
import PromoSection from './commonHomeSections/PromoSection';

const CommonHomePage = () => {
    return (
        <div>
            <CmnNavbar/>
            <CmnHeroBanner/>
            <PurposeSection/>
            <CourseSection/>
            <ArtworkGallerySection/>
            <MentorsSection/>
            <PromoSection/>
        </div>
    );
};

export default CommonHomePage;