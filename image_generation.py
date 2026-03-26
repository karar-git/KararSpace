# Image generation using FAL AI Flux
import sys
import requests
import fal_client

FAL_KEY = "3cf6dc3b-9a72-4fc9-87b0-928fb50c5b1a:836fb642d189b9a4def7710ed4dec89c"


def generate_image(prompt, save_path, size="landscape_16_9"):
    """
    Generate image using FAL AI Flux model
    size options: square_hd, square, portrait_4_3, portrait_16_9, landscape_4_3, landscape_16_9
    """
    import os

    os.environ["FAL_KEY"] = FAL_KEY

    try:
        result = fal_client.subscribe(
            "fal-ai/flux/schnell",
            arguments={
                "prompt": prompt,
                "image_size": size,
                "num_images": 1,
                "enable_safety_checker": False,
            },
        )

        if result and result.get("images"):
            image_url = result["images"][0]["url"]
            image_response = requests.get(image_url)
            if image_response.status_code == 200:
                with open(save_path, "wb") as f:
                    f.write(image_response.content)
                print(f"Image saved to {save_path}")
                return True
            else:
                print(f"Failed to download image: {image_response.status_code}")
                return False
        else:
            print("No images in response")
            return False
    except Exception as e:
        print(f"Error generating image: {e}")
        return False


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python image_generation.py <prompt> <save_path> [size]")
        print(
            "Sizes: square_hd, square, portrait_4_3, portrait_16_9, landscape_4_3, landscape_16_9"
        )
    else:
        prompt = sys.argv[1]
        save_path = sys.argv[2]
        size = sys.argv[3] if len(sys.argv) > 3 else "landscape_16_9"
        generate_image(prompt, save_path, size)
