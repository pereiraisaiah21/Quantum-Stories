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
        this.extractStoriesFromHTML()
        this.createCarouselHTML()
        this.addEventListeners()
        this.initAutoplay()
        this.updateNavigation()
        this.updateCarousel()
    }

    extractStoriesFromHTML() {
        this.posts = Array.from(
            this.carouselElement.querySelectorAll("[data-storie]")
        ).map((story) => {
            const extractData = (attribute) =>
                story.querySelector(`[data-${attribute}]`).getAttribute(`data-${attribute}`)

            return {
                order: story.getAttribute("data-order"),
                author: extractData("author"),
                dataposted: extractData("dataposted"),
                image: extractData("image"),
            }
        })

        console.log("01", this.carouselElement, this.carouselElement.querySelectorAll("[data-storie]"))
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
            <div class="slider-container">
                ${this.buildStoryHTML()}
            </div>
        </div>
    `
    }

    buildStoryHTML() {
        return `
        <div class="story" style="background-image: url()">
            ${this.buildNavbarHTML(this.posts.length)}
            ${this.buildStoryInfoHTML()}
            <div class="story-prev" id="story-prev"></div>
            <div class="story-next" id="story-next"></div>
        </div>
    `
    }

    buildNavbarHTML(postsQuantity) {
        if (postsQuantity != null) {
            const navItemsHTML = Array.from(
                { length: postsQuantity },
                (_, index) => `
            <div class="nav-item" data-index="${index}"></div>
        `
            ).join("")

            return `
            <div class="navbar">
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
        <div class="story-info">
            <div class="exit">
                <button class="button-exit">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                </button>
            </div>
            ${this.buildAuthorInfoHTML()}
            <div class="options">
                <button class="button-option">
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
        <div class="author">
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
            console.log("Long click")
            this.pauseAutoplay()
            this.isPreviewingSlide = true
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
        const authorSpan = this.carouselElement.querySelector(".author span")
        const timestampP = this.carouselElement.querySelector(".author p")

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
        this.navbarContainer = this.carouselElement.querySelector(".navbar")
        this.navItems = this.navbarContainer.querySelectorAll(".nav-item")

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
            this.imageElement = this.carouselElement.querySelector(".story")
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
        this.carouselElement.querySelector(".slider-container").remove()
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

