"use client";

import { Bus, Github, Heart } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function Footer() {
	const t = useTranslations("Footer");
	const currentYear = new Date().getFullYear();

	return (
		<footer className="w-full border-t border-border/40 bg-muted/30 pt-12 pb-24 md:pb-12" role="contentinfo">
			<div className="container mx-auto px-4 sm:px-6">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-4 items-start">
					{/* Brand/About */}
					<div className="space-y-4">
						<Link href="/" className="flex items-center gap-2.5 group">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm group-hover:bg-primary/90 transition-colors">
								<Bus className="h-4 w-4" />
							</div>
							<span className="text-sm font-bold tracking-tight">{t("brandTitle")}</span>
						</Link>
						<p className="text-xs text-muted-foreground leading-relaxed max-w-xs">{t("description")}</p>
					</div>

					{/* Quick Links */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-4">
							<span role="heading" aria-level={3} className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
								{t("navTitle")}
							</span>
							<ul className="space-y-2.5">
								<li>
									<Link
										href="/"
										className="text-xs text-foreground/70 hover:text-primary transition-colors"
									>
										{t("navRoutes")}
									</Link>
								</li>
								<li>
									<Link
										href="/fare-calculator"
										className="text-xs text-foreground/70 hover:text-primary transition-colors"
									>
										{t("navCalculator")}
									</Link>
								</li>
								<li>
									<Link
										href="/fare-chart"
										className="text-xs text-foreground/70 hover:text-primary transition-colors"
									>
										{t("navChart")}
									</Link>
								</li>
							</ul>
						</div>
						<div className="space-y-4">
							<span role="heading" aria-level={3} className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
								{t("otherTitle")}
							</span>
							<ul className="space-y-2.5">
								<li>
									<Link
										href="/about"
										className="text-xs text-foreground/70 hover:text-primary transition-colors"
									>
										{t("navAbout")}
									</Link>
								</li>
								<li>
									<a
										href="https://github.com/imamhossain94/dhaka-metro-area-bus-fare-list"
										target="_blank"
										rel="noopener noreferrer"
										className="text-xs text-foreground/70 hover:text-primary transition-colors"
									>
										{t("dataSource")}
									</a>
								</li>
							</ul>
						</div>
					</div>

					{/* Credits */}
					<div className="space-y-6 md:text-right flex flex-col md:items-end">
						<div className="space-y-2">
							<p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
								{t("builtBy")}
							</p>
							<a
								href="https://github.com/hussain-ahmed2"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 group md:justify-end"
							>
								<span className="text-xs font-semibold group-hover:text-primary transition-colors">
									Hussain Ahmed
								</span>
								<div className="h-6 w-6 rounded-full bg-background border border-border flex items-center justify-center group-hover:border-primary/30 transition-colors">
									<Github className="h-3 w-3" />
								</div>
							</a>
						</div>

						<div className="pt-2">
							<p className="text-[10px] text-muted-foreground italic flex items-center gap-1 md:justify-end">
								{t("tagline")} <Heart className="h-2.5 w-2.5 text-red-500 fill-red-500 animate-pulse" />
							</p>
						</div>
					</div>
				</div>

				<div className="mt-12 pt-8 border-t border-border/20 flex flex-col sm:flex-row justify-between items-center gap-4">
					<p className="text-[10px] text-muted-foreground">
						© {currentYear} {t("brandTitle")}. {t("allRightsReserved")}
					</p>
					<div className="flex items-center gap-6">
						<a
							href="https://github.com/hussain-ahmed2/dhaka-bus-fare"
							target="_blank"
							rel="noopener noreferrer"
							className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
						>
							<Github className="h-3 w-3" />
							Source Code
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}
