"use client";

import { useAuth } from '@/hooks/auth/use-auth';
import { useEffect } from "react";
import { UserRole } from "@/config/rbac/types";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    console.log("[Profile] Component mounted");
    console.log("[Profile] User data:", user ? {
      email: user.email,
      roles: user.roles,
      hasProfile: !!user.profile,
      roleSpecificData: user.roleSpecificData,
      verificationStatus: user.verificationStatus,
      preferences: user.preferences
    } : "No user");
  }, [user]);

  if (isLoading) {
    return null;
  }

  if (!user) {
    console.log("[Profile] No user data, returning null");
    return null;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p><span className="font-medium">Email:</span> {user.email}</p>
            <p><span className="font-medium">Status:</span> <span className="capitalize">{user.status}</span></p>
            <p><span className="font-medium">Email Verified:</span> {user.emailVerified ? 'Yes' : 'No'}</p>
            <p><span className="font-medium">Last Login:</span> {formatDate(user.lastLogin)}</p>
            <p><span className="font-medium">Account Created:</span> {formatDate(user.createdAt)}</p>
            <p><span className="font-medium">Last Updated:</span> {formatDate(user.updatedAt)}</p>
          </div>
        </div>

        {/* Personal Information */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.profile ? (
              <>
                <p><span className="font-medium">Name:</span> {user.profile.firstName || 'Not set'} {user.profile.lastName || ''}</p>
                {user.profile.phone && <p><span className="font-medium">Phone:</span> {user.profile.phone}</p>}
                {user.profile.bio && (
                  <p className="col-span-2">
                    <span className="font-medium">Bio:</span><br />
                    <span className="text-gray-600">{user.profile.bio}</span>
                  </p>
                )}

                {/* Address Information */}
                {user.profile.address && (
                  <div className="col-span-2">
                    <h3 className="text-md font-semibold mb-2">Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {user.profile.address.street && <p><span className="font-medium">Street:</span> {user.profile.address.street}</p>}
                      {user.profile.address.city && <p><span className="font-medium">City:</span> {user.profile.address.city}</p>}
                      {user.profile.address.state && <p><span className="font-medium">State:</span> {user.profile.address.state}</p>}
                      {user.profile.address.postalCode && <p><span className="font-medium">Postal Code:</span> {user.profile.address.postalCode}</p>}
                      {user.profile.address.country && <p><span className="font-medium">Country:</span> {user.profile.address.country}</p>}
                    </div>
                  </div>
                )}

                {/* Social Links */}
                {user.profile.socialLinks && Object.keys(user.profile.socialLinks).length > 0 && (
                  <div className="col-span-2">
                    <h3 className="text-md font-semibold mb-2">Social Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {user.profile.socialLinks.website && (
                        <p><span className="font-medium">Website:</span> <a href={user.profile.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{user.profile.socialLinks.website}</a></p>
                      )}
                      {user.profile.socialLinks.linkedin && (
                        <p><span className="font-medium">LinkedIn:</span> <a href={user.profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{user.profile.socialLinks.linkedin}</a></p>
                      )}
                      {user.profile.socialLinks.twitter && (
                        <p><span className="font-medium">Twitter:</span> <a href={user.profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{user.profile.socialLinks.twitter}</a></p>
                      )}
                      {user.profile.socialLinks.facebook && (
                        <p><span className="font-medium">Facebook:</span> <a href={user.profile.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{user.profile.socialLinks.facebook}</a></p>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="col-span-2">No profile information available</p>
            )}
          </div>
        </div>

        {/* Verification Status */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Verification Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p><span className="font-medium">Email Verification:</span> {user.verificationStatus.email ? 'Verified' : 'Not Verified'}</p>
            {user.verificationStatus.phone !== undefined && (
              <p><span className="font-medium">Phone Verification:</span> {user.verificationStatus.phone ? 'Verified' : 'Not Verified'}</p>
            )}
            {user.verificationStatus.documents !== undefined && (
              <p><span className="font-medium">Document Verification:</span> {user.verificationStatus.documents ? 'Verified' : 'Not Verified'}</p>
            )}
          </div>
        </div>

        {/* User Preferences */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p><span className="font-medium">Language:</span> {user.preferences.language}</p>
            <p><span className="font-medium">Timezone:</span> {user.preferences.timezone}</p>
            <p><span className="font-medium">Email Notifications:</span> {user.preferences.emailNotifications ? 'Enabled' : 'Disabled'}</p>
            <p><span className="font-medium">Push Notifications:</span> {user.preferences.pushNotifications ? 'Enabled' : 'Disabled'}</p>
            <p><span className="font-medium">Theme:</span> <span className="capitalize">{user.preferences.theme}</span></p>
          </div>
        </div>

        {/* Role-Specific Data */}
        {user.roleSpecificData && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Role-Specific Information</h2>
            <div className="space-y-4">
              {/* User Role Data */}
              {user.roles.includes(UserRole.USER) && user.roleSpecificData.user && (
                <div>
                  <h3 className="text-md font-semibold mb-2">User Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <p><span className="font-medium">Last Active:</span> {formatDate(user.roleSpecificData.user.lastActiveAt.toString())}</p>
                    {user.roleSpecificData.user.interests.length > 0 && (
                      <p className="col-span-2">
                        <span className="font-medium">Interests:</span><br />
                        <span className="text-gray-600">{user.roleSpecificData.user.interests.join(', ')}</span>
                      </p>
                    )}
                    <div className="col-span-2">
                      <span className="font-medium">Content Preferences:</span>
                      <ul className="mt-1 list-disc list-inside">
                        {user.roleSpecificData.user.preferences.contentLanguages.length > 0 && (
                          <li>Languages: {user.roleSpecificData.user.preferences.contentLanguages.join(', ')}</li>
                        )}
                        {user.roleSpecificData.user.preferences.contentTypes.length > 0 && (
                          <li>Content Types: {user.roleSpecificData.user.preferences.contentTypes.join(', ')}</li>
                        )}
                        <li>Notification Frequency: <span className="capitalize">{user.roleSpecificData.user.preferences.notificationFrequency}</span></li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Mentor Role Data */}
              {user.roles.includes(UserRole.MENTOR) && user.roleSpecificData.mentor && (
                <div>
                  <h3 className="text-md font-semibold mb-2">Mentor Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <p><span className="font-medium">Experience:</span> {user.roleSpecificData.mentor.experience} years</p>
                    <p><span className="font-medium">Rating:</span> {user.roleSpecificData.mentor.rating}</p>
                    <p><span className="font-medium">Total Students:</span> {user.roleSpecificData.mentor.totalStudents}</p>
                    <p><span className="font-medium">Total Courses:</span> {user.roleSpecificData.mentor.totalCourses}</p>
                    <p><span className="font-medium">Verification Status:</span> {user.roleSpecificData.mentor.verified ? 'Verified' : 'Not Verified'}</p>
                    {user.roleSpecificData.mentor.verificationDate && (
                      <p><span className="font-medium">Verified On:</span> {formatDate(user.roleSpecificData.mentor.verificationDate.toString())}</p>
                    )}
                    {user.roleSpecificData.mentor.expertise.length > 0 && (
                      <p className="col-span-2">
                        <span className="font-medium">Expertise:</span><br />
                        <span className="text-gray-600">{user.roleSpecificData.mentor.expertise.join(', ')}</span>
                      </p>
                    )}
                    {user.roleSpecificData.mentor.languages.length > 0 && (
                      <p className="col-span-2">
                        <span className="font-medium">Languages:</span><br />
                        <span className="text-gray-600">{user.roleSpecificData.mentor.languages.join(', ')}</span>
                      </p>
                    )}
                    {user.roleSpecificData.mentor.qualifications.length > 0 && (
                      <div className="col-span-2">
                        <span className="font-medium">Qualifications:</span>
                        <ul className="mt-1 space-y-2">
                          {user.roleSpecificData.mentor.qualifications.map((qual, idx) => (
                            <li key={idx} className="ml-4">
                              {qual.degree} in {qual.field} from {qual.institution} ({qual.year})
                              {qual.certificate && <span className="text-blue-600 ml-2">[Certificate Available]</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Seller Role Data */}
              {user.roles.includes(UserRole.SELLER) && user.roleSpecificData.seller && (
                <div>
                  <h3 className="text-md font-semibold mb-2">Seller Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <p><span className="font-medium">Business Name:</span> {user.roleSpecificData.seller.businessName}</p>
                    <p><span className="font-medium">Business Type:</span> {user.roleSpecificData.seller.businessType}</p>
                    <p><span className="font-medium">Registration Number:</span> {user.roleSpecificData.seller.registrationNumber}</p>
                    <p><span className="font-medium">Rating:</span> {user.roleSpecificData.seller.rating}</p>
                    <p><span className="font-medium">Total Sales:</span> {user.roleSpecificData.seller.totalSales}</p>
                    <p><span className="font-medium">Total Products:</span> {user.roleSpecificData.seller.totalProducts}</p>
                    <p><span className="font-medium">Verification Status:</span> {user.roleSpecificData.seller.verified ? 'Verified' : 'Not Verified'}</p>
                    {user.roleSpecificData.seller.verificationDate && (
                      <p><span className="font-medium">Verified On:</span> {formatDate(user.roleSpecificData.seller.verificationDate.toString())}</p>
                    )}

                    {/* Business Address */}
                    {user.roleSpecificData.seller.businessAddress && (
                      <div className="col-span-2">
                        <h4 className="text-sm font-semibold mb-2">Business Address</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <p><span className="font-medium">Street:</span> {user.roleSpecificData.seller.businessAddress.street}</p>
                          <p><span className="font-medium">City:</span> {user.roleSpecificData.seller.businessAddress.city}</p>
                          <p><span className="font-medium">State:</span> {user.roleSpecificData.seller.businessAddress.state}</p>
                          <p><span className="font-medium">Postal Code:</span> {user.roleSpecificData.seller.businessAddress.postalCode}</p>
                          <p><span className="font-medium">Country:</span> {user.roleSpecificData.seller.businessAddress.country}</p>
                        </div>
                      </div>
                    )}

                    {/* Banking Details */}
                    {user.roleSpecificData.seller.bankingDetails && (
                      <div className="col-span-2">
                        <h4 className="text-sm font-semibold mb-2">Banking Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <p><span className="font-medium">Bank Name:</span> {user.roleSpecificData.seller.bankingDetails.bankName}</p>
                          <p><span className="font-medium">Account Type:</span> {user.roleSpecificData.seller.bankingDetails.accountType}</p>
                          <p><span className="font-medium">Account Number:</span> ****{user.roleSpecificData.seller.bankingDetails.accountNumber.slice(-4)}</p>
                          <p><span className="font-medium">Routing Number:</span> ****{user.roleSpecificData.seller.bankingDetails.routingNumber.slice(-4)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Writer Role Data */}
              {user.roles.includes(UserRole.WRITER) && user.roleSpecificData.writer && (
                <div>
                  <h3 className="text-md font-semibold mb-2">Writer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <p><span className="font-medium">Experience:</span> {user.roleSpecificData.writer.experience.years} years</p>
                    <p><span className="font-medium">Rating:</span> {user.roleSpecificData.writer.rating}</p>
                    <p><span className="font-medium">Total Articles:</span> {user.roleSpecificData.writer.totalArticles}</p>
                    <p><span className="font-medium">Verification Status:</span> {user.roleSpecificData.writer.verified ? 'Verified' : 'Not Verified'}</p>
                    {user.roleSpecificData.writer.verificationDate && (
                      <p><span className="font-medium">Verified On:</span> {formatDate(user.roleSpecificData.writer.verificationDate.toString())}</p>
                    )}

                    {user.roleSpecificData.writer.specializations.length > 0 && (
                      <p className="col-span-2">
                        <span className="font-medium">Specializations:</span><br />
                        <span className="text-gray-600">{user.roleSpecificData.writer.specializations.join(', ')}</span>
                      </p>
                    )}

                    {user.roleSpecificData.writer.languages.length > 0 && (
                      <div className="col-span-2">
                        <span className="font-medium">Languages:</span>
                        <ul className="mt-1 list-disc list-inside">
                          {user.roleSpecificData.writer.languages.map((lang, idx) => (
                            <li key={idx}>
                              {lang.language} - {lang.proficiencyLevel}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {user.roleSpecificData.writer.experience.publications && user.roleSpecificData.writer.experience.publications.length > 0 && (
                      <div className="col-span-2">
                        <span className="font-medium">Publications:</span>
                        <ul className="mt-1 space-y-2">
                          {user.roleSpecificData.writer.experience.publications.map((pub, idx) => (
                            <li key={idx} className="ml-4">
                              {pub.title} ({formatDate(pub.date.toString())})
                              {pub.url && (
                                <a href={pub.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 ml-2 hover:underline">
                                  [View Publication]
                                </a>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {user.roleSpecificData.writer.portfolio.length > 0 && (
                      <div className="col-span-2">
                        <span className="font-medium">Portfolio Links:</span>
                        <ul className="mt-1 list-disc list-inside">
                          {user.roleSpecificData.writer.portfolio.map((link, idx) => (
                            <li key={idx}>
                              <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                {link}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Roles and Permissions */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Roles</h2>
          <div className="grid grid-cols-1 gap-4">
            <p><span className="font-medium">Roles:</span> {user.roles.map(role => (
              <span key={role} className="inline-block bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded">
                {role}
              </span>
            ))}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 