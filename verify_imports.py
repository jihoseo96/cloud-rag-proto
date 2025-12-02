import os
import importlib
import sys
import traceback

def verify_imports(start_dir):
    print(f"Verifying imports in {start_dir}...")
    error_count = 0
    
    # Add current directory to sys.path
    sys.path.insert(0, os.getcwd())

    for root, dirs, files in os.walk(start_dir):
        for file in files:
            if file.endswith(".py") and file != "__init__.py":
                # Construct module name
                rel_path = os.path.relpath(os.path.join(root, file), os.getcwd())
                module_name = rel_path.replace(os.sep, ".").replace(".py", "")
                
                try:
                    print(f"Checking {module_name}...", end="", flush=True)
                    importlib.import_module(module_name)
                    print(" OK")
                except Exception as e:
                    print(f" FAILED")
                    print(f"Error importing {module_name}: {e}")
                    # traceback.print_exc()
                    error_count += 1

    if error_count == 0:
        print("\nAll modules imported successfully!")
    else:
        print(f"\nFound {error_count} import errors.")
        sys.exit(1)

if __name__ == "__main__":
    verify_imports("app")
