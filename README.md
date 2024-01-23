# Quantum Stories

Quantum Stories is a versatile JavaScript module designed for effortlessly creating and managing story carousels. Leveraging pure JavaScript (vanilla JS), this module allows you to seamlessly integrate dynamic story presentations into your web projects.

## Installation

To integrate Quantum Stories into your project, simply use npm:

```bash
npm install quantum-stories
```

## Features

1. Adding Story Grouping
2. Forward and Backward Navigation
3. Exiting the Screen
4. Hold-to-View Stories

## Usage Example

```javascript
// Import the QuantumStories class
import { QuantumStories } from 'quantum-stories'

// Define your HTML structure with the content

 <div data-slider style="display: none!important" class="slider">
    <div data-stories>
      <div data-stories-item data-order="0">
        <div data-author="Name Author"></div>
        <div data-avatar="http://via.placeholder.com/50"></div>
        <div data-dataposted="2022-01-18T12:30:00"></div>
        <div data-image="http://via.placeholder.com/300x700"></div>
      </div>

      ...
    </div>

    ...
  </div>

// The ".slider" class is essential for the library to identify the div containing the content.
// If needed, you can add another group of stories by including another [data-stories] with content as demonstrated above.

// Create an instance of the QuantumStories class
const storiesCarousel = new QuantumStories('.slider')

// Alternatively, use an array of stories
const myStories = [
    {
        "stories": [
            {
                "order": "0",
                "author": "Name Author 1",
                "avatar": "http://via.placeholder.com/50",
                "dataposted": "2022-01-18T12:30:00",
                "image": ""
            },
        ]
    },
    {
        "stories": [
            {
                "order": "0",
                "author": "Name Author 2",
                "avatar": "http://via.placeholder.com/50",
                "dataposted": "2022-01-18T12:30:00",
                "image": ""
            },
        ]
    }
]
const storiesCarousel = new QuantumStories('.slider', myStories)

```

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Issues

If you encounter any issues or have suggestions, please report them in the Issues section.

## Contributing

Contributions are welcome! Fork the repository and submit a pull request.

## Author

Pereiraisaiah21