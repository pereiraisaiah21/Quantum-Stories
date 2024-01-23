/**
 * QuantumStories - A JavaScript module for creating a story carousel.
 *
 * @class
 * @param {string | Element} element - Selector or reference to the carousel container element.
 * @param {Array} posts - Array of objects representing the stories.
 * @param {number} [currentIndex=0] - Initial index of the displayed story.
 * @param {boolean} [isInfinite=true] - Indicates whether the carousel is infinite.
 * @param {number} [autoplayInterval=2000] - Time interval between automatic transitions.
 */
export class QuantumStories {
    constructor(
        element,
        posts,
        currentIndex = 0,
        isInfinite = true,
        autoplayInterval = 3000
    ) {
        this.carouselElement =
            typeof element === "string"
                ? document.querySelector(element)
                : element
        this.imageElement = null
        this.currentSlide = 0
        this.currentIndex = currentIndex || 0
        this.isInfinite = isInfinite
        this.autoplayInterval = autoplayInterval
        this.posts = posts
        this.autoplayTimer = null
        this.storyContainer = null
        this.navbarContainer = null
        this.navItems = null
        this.clickTimer = null
        this.isPreviewingSlide = false
        this.timeRemaining = this.autoplayInterval
        this.isAutoplayPaused = false
        this.screenMiddle = window.innerHeight / 2
        this.style = `
            .slider {
                background-color: rgba(0, 0, 0, 0.863);
                display: flex;
                height: 100vh;
                justify-content: center;
                width: 100vw;
            }
            
            .slider__container {
                height: 100vh;
                overflow: hidden;
                padding: 0;
                position: relative;
                width: 400px;
            }
            
            .slider__exit {
                padding: 0.2rem;
            }
            
            .slider__exit__button {
                background-color: unset;
                color: white;
            }
            
            .slider__info {
                display: flex;
                height: 3rem;
                padding-top: 1.2rem;
                width: 100%;
            }
            
            .slider__navbar {
                align-items: center;
                display: flex;
                justify-content: center;
                left: 50%;
                padding: 0.5rem;
                position: absolute;
                top: 0rem;
                transform: translateX(-50%);
                width: 100%;
                z-index: 2;
            }
            
            .slider__navbar__item {
                background-color: #b3b3b3ad;
                background-image: linear-gradient(
                    to right,
                    rgba(255, 255, 255, 0.74) 50%,
                    transparent 50%
                );
                background-position: 100% 0;
                background-size: 200% 100%;
                border-radius: 3px;
                flex-grow: 1;
                height: 3px;
                margin: 0 5px;
                transition: background-position 2s ease;
                width: 20px;
            }
            
            .slider__navbar__item.completed {
                background-color: rgba(255, 255, 255, 0.74);
            }
            
            .slider__navbar__item.current {
                animation: fillCurrent 2s linear forwards;
            }
            
            .slider__option {
                padding: 0.2rem;
            }
            
            .slider__options__button,
            .slider__options__button:hover,
            .slider__options__button:active,
            .slider__options__button:focus {
                background-color: unset;
                border: none;
                color: white;
            }
            
            .slider__storie {
                background-position: center;
                background-repeat: no-repeat;
                background-size: cover;
                box-shadow: inset 0px 30px 30px rgba(0, 0, 0, 0.863);
                cursor: pointer;
                display: flex;
                flex-wrap: wrap;
                height: 100%;
            }
            
            .slider__author {
                background-color: none;
                box-shadow: none;
                display: inline-flex;
                flex-grow: 1;
                padding: 0.2rem 0;
                text-align: left;
            
                div {
                    color: white;
                    display: block;
                    line-height: 1.1rem;
                    padding: 0.2rem 0 0 1rem;
            
                    p {
                        font-size: 0.8rem;
                        margin: 0;
                    }
                }
            
                img {
                    border: 1px solid white;
                    border-radius: 50%;
                }
            }
            
            .slide-transition {
                opacity: 0;
                transition: opacity 0.5s ease-in-out;
            }
            
            .slide-transition.active {
                opacity: 1;
            }
            
            .story-next,
            .story-prev {
                cursor: pointer;
                flex-grow: 0.5;
                height: 100%;
                width: 50%;
            }
            
            @keyframes fillCurrent {
                from {
                    background-position: 100% 0;
                }
            
                to {
                    background-position: 0 0;
                }
            }
        `

        this.initializeCarousel()
    }

    initializeCarousel() {
        const stories = this.extractStoriesFromHTML()

        if (stories) {
            this.createCarouselHTML()
            this.addEventListeners()
            this.initAutoplay()
            this.updateNavigation()
            this.updateCarousel()
        }
    }

    extractStoriesFromHTML() {
        if (!this.carouselElement) {
            console.error("Carousel element not found.")
            this.posts = null
            return null
        }

        const storyGroups =
            this.carouselElement.querySelectorAll("[data-stories]")

        if (!storyGroups || storyGroups.length === 0) {
            console.warn("No story groups found in the carousel.")
            this.posts = null
            return null
        }

        if (!this.posts) {
            this.posts = Array.from(storyGroups).map((storyGroup) => {
                const stories = storyGroup.querySelectorAll(
                    "[data-stories-item]"
                )

                return {
                    stories: Array.from(stories).map((story) => ({
                        order: story.getAttribute("data-order"),
                        author: story
                            .querySelector("[data-author]")
                            .getAttribute("data-author"),
                        avatar: story
                            .querySelector("[data-avatar]")
                            .getAttribute("data-avatar"),
                        dataposted: story
                            .querySelector("[data-dataposted]")
                            .getAttribute("data-dataposted"),
                        image: story
                            .querySelector("[data-image]")
                            .getAttribute("data-image")
                    }))
                }
            })
        }

        return this.posts
    }

    createCarouselHTML() {
        const carouselHTML = this.buildCarouselHTML()

        if (!this.carouselElement) {
            console.error(
                "Element not found. Make sure the element is a valid DOM element or selector."
            )
            return
        }

        const styleElement = document.createElement("style");
        styleElement.textContent = this.style;
        document.head.appendChild(styleElement);

        this.carouselElement.style.display = "block"
        this.carouselElement.innerHTML = carouselHTML
    }

    buildCarouselHTML() {
        return `
        <div class="slider">
            <div class="slider__container">
                ${this.buildStoryHTML()}
            </div>
        </div>
    `
    }

    buildStoryHTML() {
        return `
        <div class="slider__storie" style="background-image: url()">
            ${this.buildNavbarHTML()}
            ${this.buildStoryInfoHTML()}
        </div>
    `
    }

    buildNavbarHTML() {
        if (this.posts.length < 0) {
            return
        }

        if (this.posts[this.currentSlide].stories != null) {
            const navItemsHTML = Array.from(
                { length: this.posts[this.currentSlide].stories.length },
                (_, index) => `
            <div class="slider__navbar__item" data-index="${index}"></div>
        `
            ).join("")

            return `
            <div class="slider__navbar">
                ${navItemsHTML}
            </div>
        `
        } else {
            console.error(
                "postsQuantity is null."
            )
            return ""
        }
    }

    buildStoryInfoHTML() {
        return `
        <div class="slider__info">
            <div class="slider__exit">
                <button class="slider__exit__button" id="slider__exit__button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                </button>
            </div>
            ${this.buildAuthorInfoHTML()}
            <div class="slider__options">
                <button class="slider__options__button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="1"/>
                        <circle cx="12" cy="5" r="1"/>
                        <circle cx="12" cy="19" r="1"/>
                    </svg>
                </button>
            </div>
        </div>
    `
    }

    buildAuthorInfoHTML() {
        return `
        <div class="slider__author">
            <img src="http://via.placeholder.com/50" alt="User Avatar" />
            <div>
                <span></span>
                <p></p>
            </div>
        </div>
    `
    }

    addEventListeners() {
        this.carouselElement.addEventListener(
            "mousedown",
            this.handleMouseDown.bind(this)
        )
        this.carouselElement.addEventListener(
            "mouseup",
            this.handleMouseUp.bind(this)
        )
        this.carouselElement.querySelector("#slider__exit__button").addEventListener(
            "click",
            this.handleExitButtonClick.bind(this)
        )
    }

    handleMouseDown() {
        this.clickTimer = setTimeout(() => {
            this.isPreviewingSlide = true

            this.pauseAutoplay()
        }, 500)
    }

    handleMouseUp(event) {
        if (this.clickTimer) {
            if (!this.isPreviewingSlide) {
                if (event.clientX < this.screenMiddle) {
                    this.previousSlide()
                } else {
                    this.nextSlide()
                }
            } else {
                this.resumeAutoplay()
            }

            this.isPreviewingSlide = false
            clearTimeout(this.clickTimer)
        }
    }

    handleExitButtonClick() {
        this.destroyCarousel()
    }

    updateAuthorInfo() {
        const authorImg = this.carouselElement.querySelector(
            ".slider__author img"
        )
        const authorSpan = this.carouselElement.querySelector(
            ".slider__author span"
        )
        const timestampP =
            this.carouselElement.querySelector(".slider__author p")

        const currentPost =
            this.posts[this.currentSlide].stories[this.currentIndex]

        if (currentPost) {
            const { author, avatar, dataposted } = currentPost

            authorImg.src = avatar
            authorSpan.textContent = author
            const timeAgo = this.calculateTimeAgo(dataposted)
            timestampP.textContent = timeAgo
        } else {
            console.error(
                "Current post not found."
            )
        }
    }

    updateNavigation() {
        this.navbarContainer =
            this.carouselElement.querySelector(".slider__navbar")
        this.navItems = this.navbarContainer.querySelectorAll(
            ".slider__navbar__item"
        )

        this.navItems.forEach((item, i) => {
            if (i < this.currentIndex) {
                item.classList.add("completed")
                item.classList.remove("current")
            } else if (i === this.currentIndex) {
                item.classList.add("current")
                item.classList.remove("completed")
                item.style.animationDuration = `${this.autoplayInterval}ms`

                if (this.isAutoplayPaused) {
                    item.style.animationPlayState = "paused"
                } else {
                    item.style.animationPlayState = "running"
                }
            } else {
                item.classList.remove("completed", "current")
                item.style.animation = ""
            }
        })
    }

    updateImage() {
        const currentGroup = this.posts[this.currentSlide]

        if (
            currentGroup &&
            currentGroup.stories &&
            currentGroup.stories.length > 0
        ) {
            const currentPost = currentGroup.stories[this.currentIndex]

            if (currentPost) {
                this.imageElement =
                    this.carouselElement.querySelector(".slider__storie")
                    this.imageElement.style.backgroundImage = `url(${currentPost.image})`
            } else {
                console.error(
                    "Current post not found in the current group."
                )
            }
        } else {
            console.error(
                "Current group or its stories not found."
            )
        }
    }

    updateCarousel() {
        this.updateImage()
        this.updateAuthorInfo()
        this.updateNavigation()
    }

    previousSlide() {
        this.currentIndex--

        if (this.currentIndex < 0) {
            this.currentSlide--

            if (this.currentSlide < 0) {
                this.currentSlide = this.posts.length - 1
            }

            this.currentIndex = this.posts[this.currentSlide].stories.length - 1
        }

        this.updateCarousel()
        this.resetAutoplay()
    }

    nextSlide() {
        this.currentIndex++

        if (this.currentIndex >= this.posts[this.currentSlide].stories.length) {
            this.currentSlide++
            this.currentIndex = 0
        }

        if (this.currentSlide >= this.posts.length) {
            this.currentSlide = 0
        }

        if (
            !this.isInfinite &&
            this.currentIndex === 0 &&
            this.currentSlide === 0
        ) {
            this.destroyCarousel()
        } else {
            this.updateCarousel()
        }

        this.resetAutoplay()
    }

    initAutoplay() {
        this.autoplayTimer = setInterval(() => {
            if (!this.isAutoplayPaused) {
                this.timeRemaining -= 1000

                if (this.timeRemaining <= 0) {
                    this.timeRemaining = this.autoplayInterval
                    this.nextSlide()
                    this.updateNavigation()
                }
            }
        }, 1000)
    }

    pauseAutoplay() {
        this.isAutoplayPaused = true
        this.updateNavigation()
    }

    resumeAutoplay() {
        this.isAutoplayPaused = false
        this.timeRemaining = this.autoplayInterval
        this.updateNavigation()
    }

    resetAutoplay() {
        clearInterval(this.autoplayTimer)
        this.initAutoplay()
    }

    destroyCarousel() {
        this.carouselElement.removeEventListener(
            "mousedown",
            this.handleMouseDown
        )
        this.carouselElement.removeEventListener(
            "mouseup",
            this.handleMouseUp
        )
    
        const exitButton = this.carouselElement.querySelector("#slider__exit__button")
    
        if (exitButton) {
            exitButton.removeEventListener(
                "click",
                this.handleExitButtonClick
            )
        }
    
        clearInterval(this.clickTimer)
        clearInterval(this.autoplayTimer)
    
        this.carouselElement.remove()
    }
    

    calculateTimeAgo(dataposted) {
        const postDate = new Date(dataposted)
        const now = new Date()

        if (postDate > now) {
            console.error(
                "The post date is in the future."
            )
            return null
        }

        const diff = now - postDate
        const seconds = Math.floor(diff / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)

        if (hours > 0) {
            return `${hours} hour${hours > 1 ? "s" : ""} ago`
        } else if (minutes > 0) {
            return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
        } else {
            return "Just now"
        }
    }
}
