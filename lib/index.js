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

        const stories = this.carouselElement.querySelectorAll("[data-storie]")

        if (!stories || stories.length === 0) {
            console.warn("No stories found in the carousel.")
            this.posts = null
            return null
        }

        if (!this.posts) {
            this.posts = Array.from(stories).map((story) => {
                const extractData = (attribute) =>
                    story
                        .querySelector(`[data-${attribute}]`)
                        .getAttribute(`data-${attribute}`)

                return {
                    order: story.getAttribute("data-order"),
                    author: extractData("author"),
                    dataposted: extractData("dataposted"),
                    image: extractData("image")
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
            ${this.buildNavbarHTML(this.posts.length)}
            ${this.buildStoryInfoHTML()}
        </div>
    `
    }

    buildNavbarHTML(postsQuantity) {
        if (postsQuantity != null) {
            const navItemsHTML = Array.from(
                { length: postsQuantity },
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
            console.error("postsQuantity is null.")
            return ""
        }
    }

    buildStoryInfoHTML() {
        return `
        <div class="slider__info">
            <div class="slider__exit">
                <button class="slider__exit__button">
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
            <img src="https://via.placeholder.com/30x30" alt="" />
            <div>
                <span></span>
                <p>12 hours ago</p>
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

    updateAuthorInfo() {
        const authorSpan = this.carouselElement.querySelector(".slider__author span")
        const timestampP = this.carouselElement.querySelector(".slider__author p")

        const currentPost = this.posts[this.currentIndex]

        if (currentPost) {
            const { author, dataposted } = currentPost

            authorSpan.textContent = author
            const timeAgo = this.calculateTimeAgo(dataposted)
            timestampP.textContent = timeAgo
        } else {
            console.error("Current post not found.")
        }
    }

    updateNavigation() {
        this.navbarContainer = this.carouselElement.querySelector(".slider__navbar")
        this.navItems = this.navbarContainer.querySelectorAll(".slider__navbar__item")

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
        const currentPost = this.posts[this.currentIndex]

        if (currentPost && currentPost.image) {
            this.imageElement = this.carouselElement.querySelector(".slider__storie")
            this.imageElement.style.backgroundImage = `url(${currentPost.image})`
        } else {
            console.error("Current post or its image not found.")
        }
    }

    updateCarousel() {
        this.updateImage()
        this.updateAuthorInfo()
        this.updateNavigation()
    }

    previousSlide() {
        this.currentIndex =
            (this.currentIndex - 1 + this.posts.length) % this.posts.length
        this.updateCarousel()
        this.resetAutoplay()
    }

    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.posts.length

        if (!this.isInfinite && this.currentIndex === 0) {
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
        clearInterval(this.autoplayTimer)
        this.carouselElement.querySelector(".slider__container").remove()
    }

    calculateTimeAgo(dataposted) {
        const postDate = new Date(dataposted)
        const now = new Date()

        if (postDate > now) {
            console.error("The post date is in the future.")
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
