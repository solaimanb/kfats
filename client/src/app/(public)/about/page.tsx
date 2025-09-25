import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, BookOpen, Palette, Code, Award } from "lucide-react";
import Link from "next/link";
import { StatsSection } from "./_components/stats-section";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">About KFATS</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Kushtia Fine Arts & Technology School - Empowering creativity and
          innovation through comprehensive education
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              To provide exceptional education in fine arts and technology,
              fostering creativity, innovation, and professional excellence in
              our students. We believe in nurturing talent and providing the
              tools necessary for success in the modern creative economy.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Our Vision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              To be the leading institution for arts and technology education,
              recognized for producing innovative creators, skilled
              technologists, and successful entrepreneurs who contribute
              meaningfully to society and the creative industries.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* What We Offer */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">What We Offer</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="text-center">
              <Palette className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle>Fine Arts Education</CardTitle>
              <CardDescription>
                Comprehensive training in traditional and digital arts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Painting and Drawing</li>
                <li>• Digital Art & Design</li>
                <li>• Sculpture & 3D Arts</li>
                <li>• Photography</li>
                <li>• Art History & Theory</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Code className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle>Technology Training</CardTitle>
              <CardDescription>
                Cutting-edge technology education and skill development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Web Development</li>
                <li>• Software Engineering</li>
                <li>• Digital Marketing</li>
                <li>• UI/UX Design</li>
                <li>• Data Science</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle>Learning Platform</CardTitle>
              <CardDescription>
                Modern LMS with courses, mentorship, and marketplace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Interactive Courses</li>
                <li>• Expert Mentorship</li>
                <li>• Student Community</li>
                <li>• Project Portfolio</li>
                <li>• Career Support</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Our Community */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">Our Community</h2>
        <StatsSection />
      </div>

      {/* User Roles */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">
          Join Our Community
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Students</CardTitle>
              <Badge variant="secondary">Default Role</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access courses, learn from experts, and build your portfolio.
                Automatically upgraded when you enroll in your first course.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mentors</CardTitle>
              <Badge variant="outline">Application Required</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Share your expertise by creating and teaching courses. Help
                shape the next generation of creators.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Writers</CardTitle>
              <Badge variant="outline">Application Required</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Publish articles, share insights, and contribute to our
                knowledge base. Build your reputation as a thought leader.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sellers</CardTitle>
              <Badge variant="outline">Application Required</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Showcase and sell your creative work in our marketplace. Connect
                with buyers worldwide.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Writers</CardTitle>
              <Badge variant="outline">Application Required</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Publish articles, share insights, and contribute to our
                knowledge base. Build your reputation as a thought leader.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center bg-muted/50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">
          Ready to Start Your Journey?
        </h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Join thousands of students, creators, and professionals who are
          already part of the KFATS community. Whether you&apos;re here to
          learn, teach, or connect, we have something for everyone.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/courses"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Browse Courses
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Join KFATS
          </Link>
        </div>
      </div>
    </div>
  );
}
