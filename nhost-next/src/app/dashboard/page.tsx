"use client";

import { useEffect, useState } from "react";
import {
	useAuthenticationStatus,
	useSignOut,
	useUserData,
} from "@nhost/nextjs";
import { useRouter } from "next/navigation";
import { nhost } from "../../lib/nhost";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	User,
	Mail,
	Shield,
	Calendar,
	Database,
	Activity,
	TrendingUp,
	Users,
	Star,
	Home,
	LogOut,
	Loader2,
} from "lucide-react";

interface Movie {
	id: string;
	title: string;
	director: string;
	release_year: number;
	genre: string;
	rating: number;
}

const getMovies = `
  query {
    movies {
      id
      title
      director
      release_year
      genre
      rating
    }
  }
`;

export default function Dashboard() {
	const { isAuthenticated, isLoading } = useAuthenticationStatus();
	const { signOut } = useSignOut();
	const user = useUserData();
	const router = useRouter();
	const [movies, setMovies] = useState<Movie[]>([]);
	const [moviesLoading, setMoviesLoading] = useState(true);
	const [moviesError, setMoviesError] = useState<string | null>(null);

	// Redirect if not authenticated
	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push("/auth");
		}
	}, [isAuthenticated, isLoading, router]);

	// Fetch movies when component mounts
	useEffect(() => {
		async function fetchMovies() {
			try {
				setMoviesLoading(true);
				const { data, error } = await nhost.graphql.request(getMovies);

				if (error) {
					setMoviesError(
						"Failed to fetch movies. Make sure your database is set up correctly.",
					);
				} else {
					setMovies(data?.movies || []);
				}
			} catch {
				setMoviesError("Failed to connect to the database.");
			} finally {
				setMoviesLoading(false);
			}
		}

		if (isAuthenticated) {
			fetchMovies();
		}
	}, [isAuthenticated]);

	const handleSignOut = async () => {
		await signOut();
		router.push("/");
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return null; // Will be redirected by useEffect
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8 space-y-8">
				{/* Header */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div className="flex items-center gap-4">
						<Avatar className="h-12 w-12">
							<AvatarFallback>
								<User className="h-6 w-6" />
							</AvatarFallback>
						</Avatar>
						<div>
							<h1 className="text-3xl font-bold tracking-tight">
								Welcome back,{" "}
								{user?.displayName || user?.email?.split("@")[0] || "User"}!
							</h1>
							<p className="text-muted-foreground">
								{new Date().toLocaleDateString("en-US", {
									weekday: "long",
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</p>
						</div>
					</div>
					<div className="flex gap-3">
						<Button asChild variant="outline" size="sm">
							<Link href="/">
								<Home className="mr-2 h-4 w-4" />
								Home
							</Link>
						</Button>
						<Button variant="destructive" size="sm" onClick={handleSignOut}>
							<LogOut className="mr-2 h-4 w-4" />
							Sign Out
						</Button>
					</div>
				</div>

				{/* Stats Overview */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-muted-foreground">
										Account Status
									</p>
									<p className="text-2xl font-bold">
										{user?.emailVerified ? "Verified" : "Pending"}
									</p>
								</div>
								<Shield
									className={`h-8 w-8 ${user?.emailVerified ? "text-green-600" : "text-yellow-600"}`}
								/>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-muted-foreground">
										Movies
									</p>
									<p className="text-2xl font-bold">{movies.length}</p>
								</div>
								<Database className="h-8 w-8 text-blue-600" />
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-muted-foreground">
										API Status
									</p>
									<p className="text-2xl font-bold">
										{moviesError
											? "Error"
											: moviesLoading
												? "Loading"
												: "Active"}
									</p>
								</div>
								<Activity
									className={`h-8 w-8 ${moviesError ? "text-red-600" : moviesLoading ? "text-yellow-600" : "text-green-600"}`}
								/>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-muted-foreground">
										Session
									</p>
									<p className="text-2xl font-bold">Active</p>
								</div>
								<Users className="h-8 w-8 text-purple-600" />
							</div>
						</CardContent>
					</Card>
				</div>

				{/* User Profile */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<User className="h-5 w-5" />
							Profile Information
						</CardTitle>
						<CardDescription>
							Your account details and verification status
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="grid md:grid-cols-2 gap-6">
							<div className="space-y-4">
								<div className="flex items-center gap-3">
									<Mail className="h-4 w-4 text-muted-foreground" />
									<div>
										<p className="text-sm font-medium text-muted-foreground">
											Email Address
										</p>
										<p className="font-medium">{user?.email}</p>
									</div>
								</div>

								<div className="flex items-center gap-3">
									<User className="h-4 w-4 text-muted-foreground" />
									<div>
										<p className="text-sm font-medium text-muted-foreground">
											Display Name
										</p>
										<p className="font-medium">
											{user?.displayName || "Not set"}
										</p>
									</div>
								</div>
							</div>

							<div className="space-y-4">
								<div className="flex items-center gap-3">
									<Shield className="h-4 w-4 text-muted-foreground" />
									<div>
										<p className="text-sm font-medium text-muted-foreground">
											Verification Status
										</p>
										<div className="flex items-center gap-2">
											{user?.emailVerified ? (
												<Badge
													variant="default"
													className="bg-green-100 text-green-800 border-green-200"
												>
													<Shield className="h-3 w-3 mr-1" />
													Verified
												</Badge>
											) : (
												<Badge
													variant="secondary"
													className="bg-yellow-100 text-yellow-800 border-yellow-200"
												>
													<Calendar className="h-3 w-3 mr-1" />
													Pending
												</Badge>
											)}
										</div>
									</div>
								</div>

								<div className="flex items-center gap-3">
									<Database className="h-4 w-4 text-muted-foreground" />
									<div>
										<p className="text-sm font-medium text-muted-foreground">
											User ID
										</p>
										<p className="font-mono text-sm text-muted-foreground">
											{user?.id}
										</p>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Movies Section */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="flex items-center gap-2">
									<Database className="h-5 w-5" />
									Movies Database
								</CardTitle>
								<CardDescription>
									Sample data from your Nhost GraphQL API
								</CardDescription>
							</div>
							{movies.length > 0 && (
								<Badge variant="outline" className="flex items-center gap-1">
									<TrendingUp className="h-3 w-3" />
									{movies.length} movies
								</Badge>
							)}
						</div>
					</CardHeader>
					<CardContent>
						{moviesLoading ? (
							<div className="flex items-center justify-center py-12">
								<div className="text-center space-y-3">
									<Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
									<p className="text-muted-foreground">
										Loading movies from GraphQL API...
									</p>
								</div>
							</div>
						) : moviesError ? (
							<Alert variant="destructive">
								<AlertDescription>{moviesError}</AlertDescription>
								<p className="text-sm mt-2">
									Check your .env file and make sure your Nhost project is
									configured correctly.
								</p>
							</Alert>
						) : movies.length > 0 ? (
							<div className="space-y-4">
								<div className="grid gap-4">
									{movies.map((movie) => (
										<Card
											key={movie.id}
											className="transition-colors hover:bg-muted/50"
										>
											<CardContent className="p-4">
												<div className="flex items-center justify-between">
													<div className="space-y-1">
														<h3 className="font-semibold text-lg">
															{movie.title}
														</h3>
														<p className="text-sm text-muted-foreground">
															Directed by {movie.director} •{" "}
															{movie.release_year}
														</p>
													</div>
													<div className="flex items-center gap-3">
														<Badge variant="outline">{movie.genre}</Badge>
														<div className="flex items-center gap-1">
															<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
															<span className="font-medium">
																{movie.rating}
															</span>
														</div>
													</div>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</div>
						) : (
							<div className="text-center py-12">
								<div className="space-y-3">
									<Database className="h-12 w-12 mx-auto text-muted-foreground" />
									<div>
										<h3 className="font-semibold">No movies found</h3>
										<p className="text-sm text-muted-foreground">
											Set up the movies table in your Nhost database to see
											sample data here.
										</p>
									</div>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
