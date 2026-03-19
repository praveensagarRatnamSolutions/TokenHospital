"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="bg-white text-gray-900">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png" // 👉 replace with your real logo
            className="h-10"
            alt="Ratnam Solutions"
          />
          <div>
            <h1 className="text-lg font-bold text-blue-700">
              Ratnam Solutions
            </h1>
            <p className="text-xs text-gray-500">
              Smart Healthcare Solutions
            </p>
          </div>
        </div>

        <nav className="hidden md:flex gap-6 font-medium text-gray-600">
          <a href="#" className="hover:text-blue-700">
            Home
          </a>
          <a href="#" className="hover:text-blue-700">
            Features
          </a>
          <a href="#" className="hover:text-blue-700">
            Solutions
          </a>
          <a href="#" className="hover:text-blue-700">
            Contact
          </a>
        </nav>

        <div className="space-x-2">
          <a href="/login">
            <Button variant="outline">Login</Button>
          </a>
          <a href="/register">
            <Button className="bg-blue-700 hover:bg-blue-800 text-white">
              Get Started
            </Button>
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="grid md:grid-cols-2 items-center px-8 py-20 bg-gradient-to-r from-blue-50 to-white">
        <div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Modern Token Management System for Hospitals
          </h2>

          <p className="text-gray-600 mb-6">
            Built by Ratnam Solutions, this system helps hospitals manage
            patient queues efficiently with real-time updates, kiosk
            integration, and smart dashboards.
          </p>

          <div className="space-x-4">
            <Button className="bg-blue-700 text-white px-6">
              Book Demo
            </Button>
            <Button variant="outline">Explore Features</Button>
          </div>
        </div>

        <img
          src="https://images.unsplash.com/photo-1576091160550-2173dba999ef"
          className="rounded-xl shadow-xl"
          alt="Healthcare dashboard"
        />
      </section>

      {/* Features */}
      <section className="py-16 px-8">
        <h3 className="text-2xl font-bold text-center mb-10">
          Our Modern Solutions
        </h3>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition">
            <CardContent className="p-6 space-y-3">
              <img
                src="https://images.unsplash.com/photo-1551836022-d5d88e9218df"
                className="rounded-lg"
              />
              <h4 className="font-semibold text-lg">
                Real-Time Queue
              </h4>
              <p className="text-sm text-gray-600">
                Manage tokens instantly with live updates and zero delay.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition">
            <CardContent className="p-6 space-y-3">
              <img
                src="https://images.unsplash.com/photo-1581595219315-a187dd40c322"
                className="rounded-lg"
              />
              <h4 className="font-semibold text-lg">
                Doctor Dashboard
              </h4>
              <p className="text-sm text-gray-600">
                Smart interface for doctors to manage patients quickly.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition">
            <CardContent className="p-6 space-y-3">
              <img
                src="https://images.unsplash.com/photo-1581090700227-1e8c1b45d3f4"
                className="rounded-lg"
              />
              <h4 className="font-semibold text-lg">
                Kiosk Integration
              </h4>
              <p className="text-sm text-gray-600">
                Easy token generation for patients using kiosk machines.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Workflow */}
      <section className="bg-gray-50 py-16 px-8">
        <h3 className="text-2xl font-bold text-center mb-10">
          How It Works
        </h3>

        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <h4 className="font-semibold text-blue-700">
              1. Generate Token
            </h4>
            <p className="text-gray-600 text-sm">
              Patient gets token via kiosk or online.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-blue-700">
              2. Smart Queue
            </h4>
            <p className="text-gray-600 text-sm">
              System manages queue in real-time.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-blue-700">
              3. Doctor Call
            </h4>
            <p className="text-gray-600 text-sm">
              Doctor calls next patient instantly.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <h3 className="text-2xl font-bold mb-4">
          Boost Your Hospital Efficiency
        </h3>

        <p className="text-gray-600 mb-6">
          Join 300+ businesses trusting Ratnam Solutions for digital growth.
        </p>

        <Button className="bg-blue-700 text-white px-6">
          Get Started Today
        </Button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 text-center py-6 text-sm text-gray-500">
        Powered by Ratnam Solutions Pvt Ltd © {new Date().getFullYear()}
      </footer>
    </div>
  );
}