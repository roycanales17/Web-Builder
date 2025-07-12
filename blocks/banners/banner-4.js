export default {
id: 'banner-4',
	label: 'Banner 4',
	thumbnail: '/resources/images/thumbnails/banners/banner-4.png',
	category: 'Banner',
	content: `
	<div class="g--banner-hero-4">
	  <div class="g--banner-hero-4-intro-text">
		<p>Hi everyone, my name is</p>
		<h1>Hannah<br>Morales</h1>
		<p class="g--banner-hero-4-highlight">I'm a Creative<br>Marketing Assistant</p>
	  </div>
	  <div class="profile-photo">
		<img src="/resources/images/banners/banner-4.avif" alt="Hannah Morales" />
	  </div>
	</div>
	
	<style>
	  .g--banner-hero-4 {
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #e7efe1;
		height: 100vh;
		padding: 40px 20px;
		box-sizing: border-box;
		gap: 120px;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
	  }
	
	  .g--banner-hero-4-intro-text {
		display: flex;
		justify-content: center;
		align-items: center;
		text-align: center;
		flex-direction: column;
		max-width: 400px;
		flex: 1;
	  }
	
	  .g--banner-hero-4-intro-text p {
		font-size: 1.8em;
		font-weight: bold;
		margin: 0 0 10px;
		color: #323232;
		font-family: Verdana, Geneva, sans-serif;
	  }
	
	  .g--banner-hero-4-intro-text h1 {
		font-size: 4em;
		font-weight: bolder;
		margin: 0 0 20px;
		line-height: 1.2;
		letter-spacing: 1px;
  		font-family:'Inter', sans-serif;
	  }
	
	  .g--banner-hero-4-intro-text .g--banner-hero-4-highlight {
		font-size: 1.8em;
		letter-spacing: 1px;
		color: #43c579;
		font-weight: 700;
		margin-top: 10px;
	  }
	
	  .profile-photo {
		background-color: white;
		padding: 16px;
		border-radius: 24px;
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
		display: flex;
		align-items: center;
		justify-content: center;
	  }
	
	  .profile-photo img {
		width: 500px;
		min-height: 470px;
		border-radius: 16px;
		object-fit: cover;
		display: block;
	  }
	
	  @media (max-width: 1024px) {
	  .g--banner-hero-4 {
		flex-direction: column;
		height: auto;
		padding: 40px 20px;
		gap: 40px;
	  }
	
	  .g--banner-hero-4-intro-text {
		max-width: 100%;
		padding: 0 10px;
	  }
	
	  .g--banner-hero-4-intro-text h1 {
		font-size: 2.5em;
	  }
	
	  .g--banner-hero-4-intro-text p,
	  .g--banner-hero-4-intro-text .g--banner-hero-4-highlight {
		font-size: 1.2em;
	  }
	
	  .profile-photo img {
		width: 100%;
		max-width: 340px;
		min-height: auto;
	  }
	}

	</style>
	`
};
