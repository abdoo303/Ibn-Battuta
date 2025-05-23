import NavBar from "../../components/NavBar";
import i1 from "../../assets/backgrounds/homePage.png";
import TravelBuzz from "./TravelBuzz";
import Minds from "./minds";
import Last from "./last";
import Footer from "../../components/Footer";
import Cookies from "js-cookie";
const HomePage = () => {
	const userType = Cookies.get("userType") || "Guest";
	return (
		<div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
			<div
				style={{
					width: "100vw",
					height: "60vh",
					color: "#FAE2B6",
					backgroundImage: `url(${i1})`,
					backgroundSize: "100% 100%",
					backgroundPosition: "center",
					backgroundRepeat: "no-repeat",
					display: "flex",
					flexDirection: "column",
					justifyContent: "flex-end",
				}}
			>
				<div style={{ marginLeft: "5%", marginBottom: "2%" }}>
					<h1
						style={{
							fontSize: "6rem",
							fontWeight: "bold",
							marginBottom: "1rem",
							textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
							fontFamily: "serif",
							userSelect: "none",
						}}
					>
						Ibn Battuta
					</h1>

					{/* Subtitle */}
					<p
						style={{
							fontSize: "1.25rem",
							marginBottom: "2rem",
							lineHeight: "1.2",
							maxWidth: "50vw",
							textShadow: "1px 1px 3px rgba(0, 0, 0, 0.5)",
							color: "#FFFFFF",
							textOverflow: "ellipsis",
							userSelect: "none",
						}}
					>
						Discover the world without limits – plan, explore, and experience
						breathtaking destinations from the comfort of your screen. Be a nomad. Your
						virtual adventure begins here, where every journey is just a click away!
					</p>

					{userType == "Guest" && (
						<button
							style={{
								padding: "0.75rem 1.5rem",
								fontSize: "1rem",
								fontWeight: "bold",
								color: "#FFFFFF",
								backgroundColor: "transparent",
								border: "2px solid #FFFFFF",
								borderRadius: "25px",
								cursor: "pointer",
								textTransform: "uppercase",
								transition: "background-color 0.3s, color 0.3s",
							}}
							onMouseOver={(e) => {
								e.target.style.backgroundColor = "#A0522D";
								e.target.style.color = "#000000";
							}}
							onMouseOut={(e) => {
								e.target.style.backgroundColor = "transparent";
								e.target.style.color = "#FFFFFF";
							}}
							onClick={() => {
								window.location.href = "/select-your-role";
							}}
						>
							Join Now
						</button>
					)}
				</div>
			</div>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<TravelBuzz />
				<Minds />
				<Last />
				<Footer />
			</div>
		</div>
	);
};

export default HomePage;
