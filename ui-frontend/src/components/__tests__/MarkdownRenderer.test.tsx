import { render, screen } from '@/__tests__/utils/test-utils'
import MarkdownRenderer from '../MarkdownRenderer'

describe('MarkdownRenderer', () => {
  it('renders basic markdown content', () => {
    const content = '# Test Heading\n\nThis is a paragraph with **bold** text.'
    
    render(<MarkdownRenderer content={content} />)
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Heading')
    expect(screen.getByText('This is a paragraph with')).toBeInTheDocument()
    expect(screen.getByText('bold')).toBeInTheDocument()
  })

  it('renders markdown lists correctly', () => {
    const content = `
# Features
- Feature 1
- Feature 2
- Feature 3
`
    
    render(<MarkdownRenderer content={content} />)
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Features')
    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getByText('Feature 1')).toBeInTheDocument()
    expect(screen.getByText('Feature 2')).toBeInTheDocument()
    expect(screen.getByText('Feature 3')).toBeInTheDocument()
  })

  it('renders markdown links with correct attributes', () => {
    const content = 'Visit [our website](https://example.com) for more info.'
    
    render(<MarkdownRenderer content={content} />)
    
    const link = screen.getByRole('link', { name: 'our website' })
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders code blocks correctly', () => {
    const content = '```javascript\nconst test = "hello";\n```'
    
    render(<MarkdownRenderer content={content} />)
    
    expect(screen.getByText('const test = "hello";')).toBeInTheDocument()
  })

  it('renders inline code correctly', () => {
    const content = 'Use the `console.log()` function to debug.'
    
    render(<MarkdownRenderer content={content} />)
    
    expect(screen.getByText('console.log()')).toBeInTheDocument()
    expect(screen.getByText('console.log()')).toHaveClass('bg-gray-100')
  })

  it('renders blockquotes correctly', () => {
    const content = '> This is a blockquote\n> with multiple lines'
    
    render(<MarkdownRenderer content={content} />)
    
    const blockquote = screen.getByRole('blockquote')
    expect(blockquote).toBeInTheDocument()
    expect(blockquote).toHaveClass('border-l-4', 'border-indigo-200')
  })

  it('applies custom className when provided', () => {
    const content = '# Test'
    const customClass = 'custom-markdown-class'
    
    const { container } = render(<MarkdownRenderer content={content} className={customClass} />)
    
    expect(container.firstChild).toHaveClass('markdown-content', customClass)
  })

  it('handles empty content gracefully', () => {
    render(<MarkdownRenderer content="" />)
    
    const container = document.querySelector('.markdown-content')
    expect(container).toBeInTheDocument()
    expect(container).toBeEmptyDOMElement()
  })

  it('renders tables correctly', () => {
    const content = `
| Feature | Status |
|---------|--------|
| Feature 1 | ✓ |
| Feature 2 | ✗ |
`
    
    render(<MarkdownRenderer content={content} />)
    
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Feature' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Feature 1' })).toBeInTheDocument()
  })

  it('renders emphasis and strong text correctly', () => {
    const content = 'This has *italic* and **bold** text.'
    
    render(<MarkdownRenderer content={content} />)
    
    const italic = screen.getByText('italic')
    const bold = screen.getByText('bold')
    
    expect(italic.tagName).toBe('EM')
    expect(bold.tagName).toBe('STRONG')
    expect(bold).toHaveClass('font-bold', 'text-gray-900')
  })

  it('handles complex nested markdown', () => {
    const content = `
# Main Title

## Subtitle

Here's a paragraph with **bold** and *italic* text, plus a [link](https://example.com).

### Features
- Feature 1 with \`code\`
- **Bold feature**
- *Italic feature*

> Important note about the features

\`\`\`javascript
const example = "code block";
\`\`\`
`
    
    render(<MarkdownRenderer content={content} />)
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Main Title')
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Subtitle')
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Features')
    expect(screen.getByRole('link')).toHaveTextContent('link')
    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getByRole('blockquote')).toBeInTheDocument()
    expect(screen.getByText('const example = "code block";')).toBeInTheDocument()
  })
})