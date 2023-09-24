import * as React from 'react'
import { getFonts } from 'font-list'
import { DialogContent } from '../dialog'

// Define the props interface for the Font component
interface IFontProps {
  readonly selectedFontFace: string | null
  readonly onSelectedFontFaceChanged: (fontFace: string) => void
}

// Define the component's state interface
interface IFontState {
  readonly availableFonts: string[] | null
  readonly selectedFontFace: string | null
}

// Define the Font component
export class Font extends React.Component<IFontProps, IFontState> {
  public constructor(props: IFontProps) {
    super(props)
    // Initialize the component state
    this.state = {
      availableFonts: null,
      selectedFontFace: props.selectedFontFace ?? null,
    }
    // If selectedFontFace is not provided, initialize it
    if (this.state.selectedFontFace == null) {
      this.initializeSelectedFontFace()
    }
  }

  // Component lifecycle method: fetch available fonts when mounted
  public async componentDidMount() {
    try {
      // Fetch available fonts
      const fonts = await getFonts({ disableQuoting: true })

      // Update the state with available fonts
      this.setState({ availableFonts: fonts })

      // Set the default font face and value in the select element
      const fontFaceElem = document.getElementById('fontFaceChooser')
      if (fontFaceElem) {
        this.props.onSelectedFontFaceChanged(
          this.state.selectedFontFace ??
            '"Helvetica Neue", Helvetica, Arial, sans-serif'
        )
        const faceChooser: HTMLSelectElement = fontFaceElem as HTMLSelectElement
        faceChooser.value =
          this.state.selectedFontFace ??
          '"Helvetica Neue", Helvetica, Arial, sans-serif'
      }
    } catch (err) {
      // Handle errors, e.g., log them or show an error message to the user
      console.error(err)
    }
  }

  // Component lifecycle method: update state when props change
  public async componentDidUpdate(prevProps: IFontProps) {
    // Check if selectedFontFace prop has changed
    if (prevProps.selectedFontFace !== this.props.selectedFontFace) {
      // Update the state with the new selectedFontFace
      this.setState({ selectedFontFace: this.props.selectedFontFace })
    }
  }

  // Method to initialize selectedFontFace from props
  private initializeSelectedFontFace = async () => {
    const currentFontFace = this.props.selectedFontFace
    this.setState({ selectedFontFace: currentFontFace })
  }

  // Event handler for font face selection change
  private onSelectedFontFaceChanged = (
    event: React.FormEvent<HTMLSelectElement>
  ): void => {
    // Call the provided callback function when the font face selection changes
    this.props.onSelectedFontFaceChanged(event.currentTarget.value)
  }

  // Render method: display the component's UI
  public render() {
    return (
      <DialogContent>
        <label htmlFor="fontFaceChooser">Font Face</label>
        <br></br>
        <select
          defaultValue={
            this.props.selectedFontFace ??
            '"Helvetica Neue", Helvetica, Arial, sans-serif'
          }
          id="fontFaceChooser"
          onChange={this.onSelectedFontFaceChanged}
        >
          {
            // Map available fonts to option elements
            this.state.availableFonts?.map((fontName, index) => {
              return (
                <option key={index} value={fontName}>
                  {fontName}
                </option>
              )
            })
          }
        </select>
      </DialogContent>
    )
  }
}
