---
title: "Visual Basic for Applications"
name: "Visual Basic for Applications"
homepage: "https://learn.microsoft.com/en-us/office/vba/api/overview/"
references:
  - url: "https://learn.microsoft.com/en-us/office/vba/api/overview/"
    title: "Office Visual Basic for Applications (VBA) reference — Microsoft Learn"
  - url: "https://learn.microsoft.com/en-us/openspecs/microsoft_general_purpose_programming_languages/ms-vbal/d5418146-0bd2-45eb-9c7a-fd9502722c74"
    title: "[MS-VBAL]: VBA Language Specification — Microsoft Open Specifications"
  - url: "https://learn.microsoft.com/en-us/openspecs/office_file_formats/ms-ovba/575462ba-bf67-4190-9fac-c275523c75fc"
    title: "[MS-OVBA]: Office VBA File Format Structure — Microsoft Open Specifications"
  - url: "https://learn.microsoft.com/en-us/openspecs/office_file_formats/ms-ovba/7610371f-e282-4319-87c4-d5602373aaea"
    title: "[MS-OVBA] 1.1 Glossary — VBA host application, VBA project"
  - url: "https://learn.microsoft.com/en-us/office/vba/language/reference/user-interface-help/implements-statement"
    title: "Implements statement (VBA) — Microsoft VBA language reference"
  - url: "https://learn.microsoft.com/en-us/office/client-developer/excel/programming-with-the-c-api-in-excel"
    title: "Programming with the C API in Excel — Microsoft Learn (XLM superseded by VBA; VBA sheets introduced with Excel version 5)"
  - url: "https://learn.microsoft.com/en-us/office/vba/library-reference/concepts/getting-started-with-vba-in-office"
    title: "Getting started with VBA in Office — Microsoft Learn"
  - url: "https://learn.microsoft.com/en-us/office/vba/language/reference/user-interface-help/data-type-summary"
    title: "Data type summary (VBA) — Microsoft VBA language reference"
  - url: "https://learn.microsoft.com/en-us/office/vba/language/concepts/getting-started/64-bit-visual-basic-for-applications-overview"
    title: "64-bit Visual Basic for Applications overview — Microsoft Learn"
  - url: "https://learn.microsoft.com/en-us/windows/win32/com/rules-for-managing-reference-counts"
    title: "Rules for Managing Reference Counts — Windows COM (Microsoft Learn)"
  - url: "https://learn.microsoft.com/en-us/microsoft-365-apps/security/internet-macros-blocked"
    title: "Macros from the internet are blocked by default in Office — Microsoft 365 Apps"
  - url: "https://news.microsoft.com/source/1996/06/04/microsoft-announces-widespread-licensing-and-availability-of-visual-basic-applications-edition"
    title: "Microsoft Announces Widespread Licensing and Availability of Visual Basic, Applications Edition (1996)"
  - url: "https://learn.microsoft.com/en-us/shows/history/history-of-microsoft-1994"
    title: "The History of Microsoft — 1994 (Excel 5.0 listed among the year's releases)"
author: "Microsoft"
kind: "dialect"
status: "active"
paradigms:
  - "imperative"
  - "object-oriented"
typing: "gradual"
type_system:
  - "nominal"
memory:
  - "arc"
execution:
  - "interpreted"
features:
  - "class-modules"
  - "com-automation"
  - "event-handlers"
  - "interface-implementation"
  - "late-binding"
  - "macro-recording"
  - "modules"
  - "variant-type"
relations:
  - name: "Visual Basic"
    kind: "dialect-of"
  - name: "XLM"
    kind: "supersedes"
note: "Microsoft's hosted dialect of Visual Basic: a macro and automation language that runs only inside a host application. It superseded Excel's XLM macro language and made each host's object model the standard library."
---
## Overview

VBA is Microsoft's hosted dialect of [Visual Basic](/languages/visual-basic): an event-driven macro and automation language that runs only inside a host application. It replaced the [XLM macro language](/languages/xlm) as Excel's way to automate a workbook, and Microsoft publishes an [implementation-independent specification](https://learn.microsoft.com/en-us/openspecs/microsoft_general_purpose_programming_languages/ms-vbal/d5418146-0bd2-45eb-9c7a-fd9502722c74) for it even though its libraries belong to the host.

## Code

::code-group

```vb [primitives]
Option Explicit
Sub Primitives()
    Dim n As Long, s As String
    n = 42: s = "Hello"
    Dim ratio As Double: ratio = n / 2
    Debug.Print s & ", " & ratio         ' Hello, 21
End Sub
```

```vb [combinations]
Sub Combinations()
    Dim xs(1 To 3) As Long
    xs(1) = 2: xs(2) = 3: xs(3) = 5

    Dim total As Long, i As Long
    For i = LBound(xs) To UBound(xs)
        total = total + xs(i)
    Next i

    Dim box As New Collection
    box.Add total, "sum"
    Debug.Print box("sum") & " / " & xs(UBound(xs))   ' 10 / 5
End Sub
```

```vb [abstractions]
' Counter.cls — a class module: state behind a property and a method.
Private m_count As Long

Public Property Get Value() As Long
    Value = m_count
End Property

Public Sub Increment(Optional ByVal step As Long = 1)
    m_count = m_count + step
End Sub

' A standard module consuming it.
Sub Demo()
    Dim c As Counter: Set c = New Counter
    c.Increment 2: c.Increment
    Debug.Print c.Value                  ' 3
End Sub
```

```vb [idioms]
' A worksheet module: the host calls this whenever a cell changes.
Private Sub Worksheet_Change(ByVal Target As Range)
    If Target.Column = 2 Then
        Target.Offset(0, 1).Value = UCase(Target.Value)
    End If
End Sub
```

::

::note
Construction and consumption, then the host's own entry point. `Set … = New` binds a class-module instance and `Property Get` reads it back; `Worksheet_Change` is never called from code — Excel raises it by naming convention, which is also how the macro recorder emits procedures.
::

## Distinctive traits

- Hosted by definition: code runs only in an application implementing a VBA environment, so a solution ships as a document, never an executable.
- The host's object model is the standard library — programming means properties, methods and [event procedures](https://learn.microsoft.com/en-us/office/vba/api/excel.worksheet.change) on objects such as `Range`.
- A [module stream](https://learn.microsoft.com/en-us/openspecs/office_file_formats/ms-ovba/c66b58a6-f8ba-4141-9382-0612abce9926) holds source beside a version-specific compiled cache that readers must ignore; the [host's own interpreter](https://learn.microsoft.com/en-us/openspecs/office_file_formats/ms-ovba/7610371f-e282-4319-87c4-d5602373aaea) runs the project.
- [`Option Explicit`](https://learn.microsoft.com/en-us/office/vba/language/reference/user-interface-help/option-explicit-statement) makes declaration compulsory and catches typos at compile time, but [`Variant`](https://learn.microsoft.com/en-us/office/vba/language/reference/user-interface-help/variant-data-type) stays the default, so late binding is the fallback for untyped members.
- Object-oriented without inheritance: [`Implements`](https://learn.microsoft.com/en-us/office/vba/language/reference/user-interface-help/implements-statement) maps class members onto a type-library interface, and COM supplies the polymorphism.
- [COM reference counting](https://learn.microsoft.com/en-us/windows/win32/com/rules-for-managing-reference-counts) holds an object until the last reference goes out of scope; [`Set x = Nothing`](https://learn.microsoft.com/en-us/office/vba/language/reference/user-interface-help/nothing-keyword) drops one reference early.

## Status

Active: VBA 7 shipped with Office 2010 and 7.1 with Office 2013, adding [`LongPtr`](https://learn.microsoft.com/en-us/office/vba/language/concepts/getting-started/64-bit-visual-basic-for-applications-overview) for 32- and 64-bit hosts. Office has blocked macros in files from the internet by default since 2022.

## History

VBA first shipped inside Excel 5.0, taking over from the [macro-sheet XLM language](https://learn.microsoft.com/en-us/office/client-developer/excel/programming-with-the-c-api-in-excel) it has "long superseded". Microsoft's [yearly company history](https://learn.microsoft.com/en-us/shows/history/history-of-microsoft-1994) lists Excel 5.0 under 1994 while other accounts say 1993, so the release year is left blank here. Microsoft began [licensing VBA to other vendors in 1996](https://news.microsoft.com/source/1996/06/04/microsoft-announces-widespread-licensing-and-availability-of-visual-basic-applications-edition).
