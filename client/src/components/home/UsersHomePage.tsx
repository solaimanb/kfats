import React from 'react';
import UserHomeNavbar from '../shared/navbars/UserHomeNavbar';
import HeroLoggedIn from '../banners/HeroLoggedIn';

const UsersHomePage = () => {
    return (
        <div>
            <UserHomeNavbar/>
            <HeroLoggedIn/>
        </div>
    );
};

export default UsersHomePage;