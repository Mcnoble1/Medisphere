import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl font-bold text-foreground">
                MediSphere™
              </span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              The decentralized health ecosystem on Hedera, transforming
              healthcare across Africa.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Services</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a
                  href="/persona-vault"
                  className="hover:text-foreground transition-colors"
                >
                  PersonaVault™
                </a>
              </li>
              <li>
                <a
                  href="/lifechain"
                  className="hover:text-foreground transition-colors"
                >
                  LifeChain™
                </a>
              </li>
              <li>
                <a
                  href="/databridge"
                  className="hover:text-foreground transition-colors"
                >
                  DataBridge™
                </a>
              </li>
              <li>
                <a
                  href="/medflow"
                  className="hover:text-foreground transition-colors"
                >
                  MedFlow™
                </a>
              </li>
              <li>
                <a
                  href="/carexpay"
                  className="hover:text-foreground transition-colors"
                >
                  CareXPay™
                </a>
              </li>
              <li>
                <a
                  href="/claimsphere"
                  className="hover:text-foreground transition-colors"
                >
                  ClaimSphere™
                </a>
              </li>
              <li>
                <a
                  href="/meditrace"
                  className="hover:text-foreground transition-colors"
                >
                  MediTrace™
                </a>
              </li>
              <li>
                <a
                  href="/impactgrid"
                  className="hover:text-foreground transition-colors"
                >
                  ImpactGrid™
                </a>
              </li>
              <li>
                <a
                  href="/healthiq"
                  className="hover:text-foreground transition-colors"
                >
                  HealthIQ™
                </a>
              </li>
              <li>
                <a
                  href="/govhealth"
                  className="hover:text-foreground transition-colors"
                >
                  GovHealth™
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Company</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Press
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Support</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>
            &copy; 2024 MediSphere™. All rights reserved. Powered by Hedera
            Blockchain.
          </p>
        </div>
      </div>
    </footer>
  );
}
