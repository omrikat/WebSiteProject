# PiGallery2 performance benchmark results

These results are created mostly for development, but the results are public for curious users.

You can also run it on your files by using the [docker-compose.yml](docker-compose) file.

See all benchmark results in [HISTORY.md](HISTORY.md)

## PiGallery2 v1.9.3, 22.03.2022
**Version**: v1.9.3, built at: Mon Mar 21 2022 21:40:36 GMT+0000 (Coordinated Universal Time), git commit:6394eb4f86f119fd36de9fd06295c9345fc02a33
**System**: Raspberry Pi 4 4G Model B, SandisK Mobile Ultra 32Gb CLass10, UHS-I, HDD: Western Digital Elements 1TB (WDBUZG0010BBK)

**Gallery**: directories: 31, photos: 2036, videos: 35, diskUsage : 22.08GB, persons : 1381, unique persons (faces): 25

| Action | Sub action | Average Duration | Result  |
|:------:|:----------:|:----------------:|:-------:|
| **Scanning directory** | | **10915.9 ms** | **media: 698, directories: 0, size: 266.29KB** |
| **Saving directory to DB** | | **1789.6 ms** | **-** |
| **List directory** | | **326.9 ms** | **media: 698, directories: 0, size: 284.60KB** |
| | Authenticate | 0.1 ms | - |
| | Normalize path param | 0.0 ms | - |
| | Authorise path | 0.0 ms | - |
| | Inject gallery version | 2.7 ms | - |
| | List directory | 252.2 ms | media: 698, directories: 0, size: 429.46KB |
| | Add thumbnail information | 53.8 ms | media: 698, directories: 0, size: 429.46KB |
| | Clean up gallery results | 17.7 ms | media: 698, directories: 0, size: 284.60KB |
| | Add server timing | 0.1 ms | media: 698, directories: 0, size: 284.60KB |
| | Render result | 0.0 ms | media: 698, directories: 0, size: 284.60KB |
| **Listing Faces** | | **41.7 ms** | **items: 25, size: 2.20KB** |
| | Authenticate | 0.1 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 2.8 ms | - |
| | List persons | 35.1 ms | items: 25, size: 22.06KB |
| | Add thumbnail info for persons | 1.7 ms | items: 25, size: 22.63KB |
| | Clean up person results | 1.7 ms | items: 25, size: 2.20KB |
| | Add server timing | 0.1 ms | items: 25, size: 2.20KB |
| | Render result | 0.0 ms | items: 25, size: 2.20KB |
| **Searching for `a`** | | **787.5 ms** | **media: 2001, directories: 0, size: 1.16MB** |
| | Authenticate | 0.1 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 0.2 ms | - |
| | Search | 580.8 ms | media: 2001, directories: 0, size: 1.43MB |
| | Add thumbnail information | 159.6 ms | media: 2001, directories: 0, size: 1.43MB |
| | Clean up gallery results | 46.5 ms | media: 2001, directories: 0, size: 1.16MB |
| | Add server timing | 0.1 ms | media: 2001, directories: 0, size: 1.16MB |
| | Render result | 0.0 ms | media: 2001, directories: 0, size: 1.16MB |
| **Searching for `caption:a`** | | **11.1 ms** | **media: 0, directories: 0, size: 104.00B** |
| | Authenticate | 0.1 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 0.2 ms | - |
| | Search | 10.5 ms | media: 0, directories: 0, size: 104.00B |
| | Add thumbnail information | 0.1 ms | media: 0, directories: 0, size: 104.00B |
| | Clean up gallery results | 0.0 ms | media: 0, directories: 0, size: 104.00B |
| | Add server timing | 0.0 ms | media: 0, directories: 0, size: 104.00B |
| | Render result | 0.0 ms | media: 0, directories: 0, size: 104.00B |
| **Searching for `directory:a`** | | **665.5 ms** | **media: 1705, directories: 0, size: 937.45KB** |
| | Authenticate | 0.1 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 0.2 ms | - |
| | Search | 490.3 ms | media: 1705, directories: 0, size: 1.20MB |
| | Add thumbnail information | 135.2 ms | media: 1705, directories: 0, size: 1.20MB |
| | Clean up gallery results | 39.5 ms | media: 1705, directories: 0, size: 937.45KB |
| | Add server timing | 0.1 ms | media: 1705, directories: 0, size: 937.45KB |
| | Render result | 0.0 ms | media: 1705, directories: 0, size: 937.45KB |
| **Searching for `file-name:a`** | | **42.6 ms** | **media: 79, directories: 0, size: 19.10KB** |
| | Authenticate | 0.1 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 0.2 ms | - |
| | Search | 33.9 ms | media: 79, directories: 0, size: 44.65KB |
| | Add thumbnail information | 6.3 ms | media: 79, directories: 0, size: 44.65KB |
| | Clean up gallery results | 1.9 ms | media: 79, directories: 0, size: 19.10KB |
| | Add server timing | 0.1 ms | media: 79, directories: 0, size: 19.10KB |
| | Render result | 0.0 ms | media: 79, directories: 0, size: 19.10KB |
| **Searching for `keyword:a`** | | **615.6 ms** | **media: 1536, directories: 0, size: 864.26KB** |
| | Authenticate | 0.1 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 0.2 ms | - |
| | Search | 458.4 ms | media: 1536, directories: 0, size: 1.08MB |
| | Add thumbnail information | 120.9 ms | media: 1536, directories: 0, size: 1.08MB |
| | Clean up gallery results | 35.7 ms | media: 1536, directories: 0, size: 864.26KB |
| | Add server timing | 0.1 ms | media: 1536, directories: 0, size: 864.26KB |
| | Render result | 0.0 ms | media: 1536, directories: 0, size: 864.26KB |
| **Searching for `person:a`** | | **345.3 ms** | **media: 825, directories: 0, size: 558.95KB** |
| | Authenticate | 0.1 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 0.2 ms | - |
| | Search | 259.2 ms | media: 825, directories: 0, size: 657.60KB |
| | Add thumbnail information | 65.1 ms | media: 825, directories: 0, size: 657.60KB |
| | Clean up gallery results | 20.5 ms | media: 825, directories: 0, size: 558.95KB |
| | Add server timing | 0.1 ms | media: 825, directories: 0, size: 558.95KB |
| | Render result | 0.0 ms | media: 825, directories: 0, size: 558.95KB |
| **Searching for `position:a`** | | **462.3 ms** | **media: 1133, directories: 0, size: 757.51KB** |
| | Authenticate | 0.1 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 0.2 ms | - |
| | Search | 346.9 ms | media: 1133, directories: 0, size: 855.88KB |
| | Add thumbnail information | 89.3 ms | media: 1133, directories: 0, size: 855.88KB |
| | Clean up gallery results | 25.5 ms | media: 1133, directories: 0, size: 757.51KB |
| | Add server timing | 0.1 ms | media: 1133, directories: 0, size: 757.51KB |
| | Render result | 0.0 ms | media: 1133, directories: 0, size: 757.51KB |
| **Searching for `.`** | | **784.8 ms** | **media: 2001, directories: 0, size: 1.15MB** |
| | Authenticate | 0.1 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 0.2 ms | - |
| | Search | 580.6 ms | media: 2001, directories: 0, size: 1.43MB |
| | Add thumbnail information | 157.5 ms | media: 2001, directories: 0, size: 1.43MB |
| | Clean up gallery results | 46.2 ms | media: 2001, directories: 0, size: 1.15MB |
| | Add server timing | 0.1 ms | media: 2001, directories: 0, size: 1.15MB |
| | Render result | 0.0 ms | media: 2001, directories: 0, size: 1.15MB |
| **Searching for `<Most common name>`** | | **124.5 ms** | **media: 262, directories: 0, size: 182.97KB** |
| | Authenticate | 0.1 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 0.2 ms | - |
| | Search | 94.7 ms | media: 262, directories: 0, size: 211.22KB |
| | Add thumbnail information | 21.9 ms | media: 262, directories: 0, size: 211.22KB |
| | Clean up gallery results | 7.3 ms | media: 262, directories: 0, size: 182.97KB |
| | Add server timing | 0.1 ms | media: 262, directories: 0, size: 182.97KB |
| | Render result | 0.0 ms | media: 262, directories: 0, size: 182.97KB |
| **Searching for `<Most AND second common names>`** | | **26.8 ms** | **media: 20, directories: 0, size: 18.03KB** |
| | Authenticate | 0.0 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 0.2 ms | - |
| | Search | 24.0 ms | media: 20, directories: 0, size: 19.70KB |
| | Add thumbnail information | 1.7 ms | media: 20, directories: 0, size: 19.70KB |
| | Clean up gallery results | 0.6 ms | media: 20, directories: 0, size: 18.03KB |
| | Add server timing | 0.1 ms | media: 20, directories: 0, size: 18.03KB |
| | Render result | 0.0 ms | media: 20, directories: 0, size: 18.03KB |
| **Searching for `<Most OR second common names>`** | | **198.3 ms** | **media: 448, directories: 0, size: 311.45KB** |
| | Authenticate | 0.1 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 0.2 ms | - |
| | Search | 150.0 ms | media: 448, directories: 0, size: 366.49KB |
| | Add thumbnail information | 36.0 ms | media: 448, directories: 0, size: 366.49KB |
| | Clean up gallery results | 11.8 ms | media: 448, directories: 0, size: 311.45KB |
| | Add server timing | 0.1 ms | media: 448, directories: 0, size: 311.45KB |
| | Render result | 0.0 ms | media: 448, directories: 0, size: 311.45KB |
| **Searching for `<Contain at least 2 out of all names>`** | | **364.0 ms** | **media: 323, directories: 0, size: 248.34KB** |
| | Authenticate | 0.1 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 0.2 ms | - |
| | Search | 326.4 ms | media: 323, directories: 0, size: 284.36KB |
| | Add thumbnail information | 27.2 ms | media: 323, directories: 0, size: 284.36KB |
| | Clean up gallery results | 9.8 ms | media: 323, directories: 0, size: 248.34KB |
| | Add server timing | 0.1 ms | media: 323, directories: 0, size: 248.34KB |
| | Render result | 0.0 ms | media: 323, directories: 0, size: 248.34KB |
| **Auto complete for `a`** | | **13.5 ms** | **items: 24, size: 979.00B** |
| | Authenticate | 0.0 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 0.2 ms | - |
| | Autocomplete | 13.0 ms | items: 24, size: 979.00B |
| | Add server timing | 0.1 ms | items: 24, size: 979.00B |
| | Render result | 0.0 ms | items: 24, size: 979.00B |

*Measurements run 20 times and an average was calculated.
Full runtime: 1522539.0ms


