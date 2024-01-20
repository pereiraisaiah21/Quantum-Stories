/**
 * QuantumStories - A JavaScript module for creating a story carousel.
 *
 * @class
 * @param {string | Element} element - Selector or reference to the carousel container element.
 * @param {number} [currentIndex=0] - Initial index of the displayed story.
 * @param {boolean} [isInfinite=true] - Indicates whether the carousel is infinite.
 * @param {number} [autoplayInterval=2000] - Time interval between automatic transitions.
 * @param {Array} posts - Array of objects representing the stories.
 *
 * @example
 * // Include the QuantumStories module in your project
 * <script src="path/to/QUANTUM-STORIES/src/index.js"></script>
 *
 * // Create a new instance of QuantumStories
 * const myCarousel = new QuantumStories('.carousel-container', 0, true, 3000, [
 *   { order: 1, author: 'John Doe', dataposted: '2022-01-20', image: 'path/to/image1.jpg' },
 *   // ... more story objects ...
 * ])
 */
export class QuantumStories {
    constructor(element, currentIndex = 0, isInfinite = true, autoplayInterval = 3000, posts) {
        this.element = typeof element === 'string' ? document.querySelector(element) : element
        this.imageElement = null
        this.currentIndex = currentIndex || 0
        this.isInfinite = isInfinite
        this.autoplayInterval = autoplayInterval
        this.posts = posts
        this.autoplayTimer = null
        this.stories = null
        this.stepsContainer = null
        this.steps = null

        this.init()
    }

    /**
     *
     */
    init() {
        this.getStoriesFromHTML()
        this.createStoriesHTML()
        this.addEventListeners()
        this.autoplay()
        this.updateSlider()
    }

    /**
     *
     */
    getStoriesFromHTML() {
        this.posts = Array.from(this.element.querySelectorAll('[data-storie]')).map(story => {
            const extractData = (attribute) => story.querySelector(`[data-${attribute}]`).getAttribute(`data-${attribute}`)
            
            return {
                order: story.getAttribute('data-order'),
                author: extractData('author'),
                dataposted: extractData('dataposted'),
                image: extractData('image'),
            }
        })
    }
    
    /**
     *
     */
    createStoriesHTML() {
        if (!this.element) {
            console.error('Element not found. Make sure the element is a valid DOM element or selector.')
            return
        }
    
        this.element.style.display = 'block'

        const sliderHTML = this.createSliderHTML()
        this.element.innerHTML = sliderHTML
    }
    
    /**
     *
     */
    createSliderHTML() {
        return `
            <div class="slider">
                <div class="slider-container">
                    ${this.createStoryHTML()}
                </div>
            </div>
        `
    }
    
    /**
     *
     */
    createStoryHTML() {
        return `
            <div class="story" style="background-image: url()">
                ${this.createNavbarHTML(this.posts.length)}
                ${this.createStoryInfoHTML()}
                <div class="story-prev" id="story-prev"></div>
                <div class="story-next" id="story-next"></div>
            </div>
        `
    }
    
    /**
     *
     */
    createNavbarHTML(postsQuantity) {

        if (postsQuantity != null) {
            const navItemsHTML = Array.from({ length: postsQuantity }, (_, index) => `
                <div class="nav-item" data-index="${index}"></div>
            `).join('')
    
            return `
                <div class="navbar">
                    ${navItemsHTML}
                </div>
            `
        } else {
            console.error('postsQuantity is null or undefined.')
            return ''
        }
    }
    
    /**
     *
     */
    createStoryInfoHTML() {
        return `
            <div class="story-info">
                <div class="exit">
                    <button class="button-exit">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                    </button>
                </div>
                ${this.createAuthorHTML()}
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
    
    /**
     *
     */
    createAuthorHTML() {
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

    /**
     *
     */
    addEventListeners() {
        this.element.querySelector('.story-prev').addEventListener('click', () => this.prevSlide())
        this.element.querySelector('.story-next').addEventListener('click', () => this.nextSlide())
    }

    /**
     *
     */
    updateAuthorInfo() {
        const authorSpan = this.element.querySelector('.author span')
        const timestampP = this.element.querySelector('.author p')
    
        const currentPost = this.posts[this.currentIndex]
    
        if (currentPost) {
            const { author, dataposted } = currentPost
    
            authorSpan.textContent = author
            const timeAgo = this.getTimeAgo(dataposted)
            timestampP.textContent = timeAgo
        } else {
            console.error('Current post not found.')
        }
    }
    
    /**
     *
     */
    updateSteps() {
        this.stepsContainer = this.element.querySelector('.navbar')
        this.steps = this.stepsContainer.querySelectorAll('.nav-item')

        this.steps.forEach((item, i) => {
            if (i < this.currentIndex) {
                item.classList.add('completed')
                item.classList.remove('current')
            } else if (i === this.currentIndex) {
                item.classList.add('current')
                item.classList.remove('completed')
                item.style.animationDuration = `${this.autoplayInterval}ms`
            } else {
                item.classList.remove('completed', 'current')
                item.style.animation = ''
            }
        })
    }

    /**
     *
     */
    updateImage() {
        const currentPost = this.posts[this.currentIndex]

        if (currentPost && currentPost.image) {
            this.imageElement = this.element.querySelector('.story')
            this.imageElement.style.backgroundImage = `url(${currentPost.image})`
        } else {
            console.error('Current post or its image not found.')
        }
    }

    /**
     *
     */
    updateSlider() {
        this.updateImage()
        this.updateAuthorInfo()
        this.updateSteps()
    }

    /**
     *
     */
    prevSlide() {
        this.currentIndex = (this.currentIndex - 1 + this.posts.length) % this.posts.length
        this.updateSlider()
        this.resetAutoplay()
    }

    /**
     *
     */
    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.posts.length

        if (!this.isInfinite && this.currentIndex === 0) {
            this.destroySlider()
        } else {
            this.updateSlider()
        }

        this.resetAutoplay()
    }

    /**
     *
     */
    autoplay() {
        this.autoplayTimer = setInterval(() => {
            this.nextSlide()
        }, this.autoplayInterval)
    }

    /**
     *
     */
    resetAutoplay() {
        clearInterval(this.autoplayTimer)
        this.autoplay()
    }

    /**
     *
     */
    destroySlider() {
        clearInterval(this.autoplayTimer)

        this.element.querySelector('.story-prev').removeEventListener('click', () => this.prevSlide())
        this.element.querySelector('.story-next').removeEventListener('click', () => this.nextSlide())
        this.element.querySelector(".slider-container").remove()
    }

    /**
     *
     */
    getTimeAgo(dataposted) {
        const postDate = new Date(dataposted)
        const now = new Date()

        if (postDate > now) {
            console.error('A data do post é no futuro.')
            return null
        }

        const diff = now - postDate
        const seconds = Math.floor(diff / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)

        if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''} ago`
        } else if (minutes > 0) {
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
        } else {
            return 'Just now'
        }
    }
}